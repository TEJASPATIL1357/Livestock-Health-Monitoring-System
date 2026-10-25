package com.smartlivestock.backend.auth.service;

import com.smartlivestock.backend.auth.dto.AuthResponse;
import com.smartlivestock.backend.auth.dto.LoginRequest;
import com.smartlivestock.backend.auth.dto.LogoutRequest;
import com.smartlivestock.backend.auth.dto.RefreshTokenRequest;
import com.smartlivestock.backend.auth.entity.RefreshToken;
import com.smartlivestock.backend.auth.jwt.JwtTokenProvider;
import com.smartlivestock.backend.auth.repository.RefreshTokenRepository;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.user.dto.UserResponse;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenHasher tokenHasher;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration-ms:2592000000}")
    private long refreshTokenExpirationMs;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       TokenHasher tokenHasher) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenHasher = tokenHasher;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String rawIdentifier = request.getEmail() != null ? request.getEmail().trim() : "";
        String normalizedIdentifier = rawIdentifier.toLowerCase();

        log.info("[AuthDiagnostic] Attempting login lookup for normalized identifier: '{}'", normalizedIdentifier);

        User user = userRepository.findByEmailIgnoreCase(normalizedIdentifier)
                .or(() -> userRepository.findByPhone(rawIdentifier))
                .or(() -> userRepository.findByEmail(normalizedIdentifier.contains("@") ? normalizedIdentifier : normalizedIdentifier + "@farm.com"))
                .orElseThrow(() -> {
                    log.warn("[AuthDiagnostic] User lookup failed for identifier: '{}'", normalizedIdentifier);
                    return new AuthException("INVALID_CREDENTIALS", "Invalid email or password", 401);
                });

        log.info("[AuthDiagnostic] User found (ID: {}, Role: {}, Status: {})", user.getId(), user.getRole(), user.getStatus());

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        log.info("[AuthDiagnostic] Password match result: {}", passwordMatches);

        if (!passwordMatches) {
            log.warn("[AuthDiagnostic] Password verification failed for user ID: {}", user.getId());
            throw new AuthException("INVALID_CREDENTIALS", "Invalid email or password", 401);
        }

        validateAccountStatus(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole());
        String rawRefreshToken = generateSecureRandomToken();
        String tokenHash = tokenHasher.hashToken(rawRefreshToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiresAt(OffsetDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000L));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(accessToken, rawRefreshToken, accessTokenExpirationMs / 1000, UserResponse.fromEntity(user));
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String rawToken = request.getRefreshToken();
        if (rawToken == null || rawToken.isBlank()) {
            throw new AuthException("REFRESH_TOKEN_INVALID", "Refresh token is required", 400);
        }

        String tokenHash = tokenHasher.hashToken(rawToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AuthException("REFRESH_TOKEN_INVALID", "Invalid refresh token", 401));

        if (token.isRevoked()) {
            // Replay attack protection: revoke all active tokens for this user
            List<RefreshToken> activeTokens = refreshTokenRepository.findByUserId(token.getUser().getId());
            for (RefreshToken activeToken : activeTokens) {
                if (!activeToken.isRevoked()) {
                    activeToken.setRevokedAt(OffsetDateTime.now());
                    refreshTokenRepository.save(activeToken);
                }
            }
            throw new AuthException("TOKEN_REVOKED", "Refresh token has been revoked", 401);
        }

        if (token.isExpired()) {
            throw new AuthException("TOKEN_EXPIRED", "Refresh token has expired", 401);
        }

        User user = token.getUser();
        validateAccountStatus(user);

        // Revoke current token (Rotation)
        token.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(token);

        // Issue new token pair
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole());
        String newRawRefreshToken = generateSecureRandomToken();
        String newTokenHash = tokenHasher.hashToken(newRawRefreshToken);

        RefreshToken newToken = new RefreshToken();
        newToken.setUser(user);
        newToken.setTokenHash(newTokenHash);
        newToken.setExpiresAt(OffsetDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000L));
        refreshTokenRepository.save(newToken);

        return new AuthResponse(newAccessToken, newRawRefreshToken, accessTokenExpirationMs / 1000, UserResponse.fromEntity(user));
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String rawToken = request.getRefreshToken();
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        try {
            String tokenHash = tokenHasher.hashToken(rawToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null) {
                    try {
                        Object principal = auth.getPrincipal();
                        UUID authenticatedUserId = (principal instanceof UUID) ? (UUID) principal : UUID.fromString(principal.toString());
                        if (!token.getUser().getId().equals(authenticatedUserId)) {
                            // Do not allow User A to revoke User B's token
                            return;
                        }
                    } catch (Exception ignored) {
                        // Ignore principal conversion exception
                    }
                }
                if (!token.isRevoked()) {
                    token.setRevokedAt(OffsetDateTime.now());
                    refreshTokenRepository.save(token);
                }
            });
        } catch (Exception ignored) {
            // Ignore invalid token formatting on logout to remain idempotent
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        validateAccountStatus(user);
        return UserResponse.fromEntity(user);
    }

    private void validateAccountStatus(User user) {
        AccountStatus status = user.getStatus();
        if (status == AccountStatus.SUSPENDED) {
            throw new AuthException("ACCOUNT_SUSPENDED", "Account has been suspended", 403);
        } else if (status == AccountStatus.DEACTIVATED) {
            throw new AuthException("ACCOUNT_DEACTIVATED", "Account has been deactivated", 403);
        } else if (status == AccountStatus.PENDING_VERIFICATION) {
            throw new AuthException("ACCOUNT_NOT_VERIFIED", "Account is pending verification", 403);
        } else if (status != AccountStatus.ACTIVE) {
            throw new AuthException("ACCOUNT_INACTIVE", "Account is not active", 403);
        }
    }

    private String generateSecureRandomToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
