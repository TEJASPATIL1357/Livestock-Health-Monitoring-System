package com.smartlivestock.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlivestock.backend.auth.dto.AuthResponse;
import com.smartlivestock.backend.auth.dto.LoginRequest;
import com.smartlivestock.backend.auth.dto.LogoutRequest;
import com.smartlivestock.backend.auth.dto.RefreshTokenRequest;
import com.smartlivestock.backend.auth.entity.RefreshToken;
import com.smartlivestock.backend.auth.jwt.JwtTokenProvider;
import com.smartlivestock.backend.auth.repository.RefreshTokenRepository;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.user.dto.CreateUserRequest;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TokenHasher tokenHasher;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.issuer:smart-livestock-api}")
    private String jwtIssuer;

    @Value("${jwt.audience:smart-livestock-mobile}")
    private String jwtAudience;

    private User activeUser;
    private final String RAW_PASSWORD = "Password123!";

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        refreshTokenRepository.deleteAll();

        activeUser = new User();
        activeUser.setName("Active Farmer");
        activeUser.setEmail("active@farm.com");
        activeUser.setPhone("+919876543210");
        activeUser.setPasswordHash(passwordEncoder.encode(RAW_PASSWORD));
        activeUser.setRole(UserRole.FARM_OWNER);
        activeUser.setStatus(AccountStatus.ACTIVE);
        activeUser.setPreferredLanguage("en");
        activeUser = userRepository.save(activeUser);
    }

    // ==========================================
    // 1. POST /api/v1/auth/login Scenarios
    // ==========================================

    @Test
    @DisplayName("1. Login Success - Returns tokens, expiration, bearer type, and user DTO")
    void login_Success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andExpect(jsonPath("$.user.id").value(activeUser.getId().toString()))
                .andExpect(jsonPath("$.user.email").value("active@farm.com"))
                .andExpect(jsonPath("$.user.role").value("FARM_OWNER"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("2. Login Invalid Email - Returns 401 Unauthorized")
    void login_InvalidEmail() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@farm.com");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("3. Login Invalid Password - Returns 401 Unauthorized")
    void login_InvalidPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("4. Login Blank Email - Returns 400 Bad Request")
    void login_BlankEmail() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("5. Login Invalid Email Format - Returns 400 Bad Request")
    void login_InvalidEmailFormat() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("invalid-email-format");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("6. Login Blank Password - Returns 400 Bad Request")
    void login_BlankPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword("");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("7. Login Account Suspended - Returns 403 Forbidden ACCOUNT_SUSPENDED")
    void login_AccountSuspended() throws Exception {
        activeUser.setStatus(AccountStatus.SUSPENDED);
        userRepository.save(activeUser);

        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_SUSPENDED"));
    }

    @Test
    @DisplayName("8. Login Account Deactivated - Returns 403 Forbidden ACCOUNT_DEACTIVATED")
    void login_AccountDeactivated() throws Exception {
        activeUser.setStatus(AccountStatus.DEACTIVATED);
        userRepository.save(activeUser);

        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_DEACTIVATED"));
    }

    @Test
    @DisplayName("9. Login Account Pending Verification - Returns 403 Forbidden ACCOUNT_NOT_VERIFIED")
    void login_AccountPendingVerification() throws Exception {
        activeUser.setStatus(AccountStatus.PENDING_VERIFICATION);
        userRepository.save(activeUser);

        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_NOT_VERIFIED"));
    }

    @Test
    @DisplayName("10. Login Case Insensitive Email - Uppercase email succeeds")
    void login_EmailCaseInsensitive() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("ACTIVE@FARM.COM");
        request.setPassword(RAW_PASSWORD);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("active@farm.com"));
    }

    @Test
    @DisplayName("11. Login Refresh Token Hashing - Database only stores SHA-256 hash, not raw token")
    void login_RefreshTokenStoredAsHash() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("active@farm.com");
        request.setPassword(RAW_PASSWORD);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        String rawRefreshToken = authResponse.getRefreshToken();
        String expectedHash = tokenHasher.hashToken(rawRefreshToken);

        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(activeUser.getId());
        assertEquals(1, tokens.size());
        assertEquals(expectedHash, tokens.get(0).getTokenHash());
        assertNotEquals(rawRefreshToken, tokens.get(0).getTokenHash());
    }

    // ==========================================
    // 2. JWT Authentication & Validation Scenarios
    // ==========================================

    @Test
    @DisplayName("12. JWT Validation Valid Token - Accesses protected /me endpoint successfully")
    void jwtValidation_ValidToken() throws Exception {
        String token = jwtTokenProvider.generateAccessToken(activeUser.getId(), activeUser.getRole());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(activeUser.getId().toString()))
                .andExpect(jsonPath("$.email").value("active@farm.com"));
    }

    @Test
    @DisplayName("13. JWT Validation Missing Header - Returns 401 Unauthorized")
    void jwtValidation_MissingHeader() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("14. JWT Validation Invalid Bearer Prefix - Returns 401 Unauthorized")
    void jwtValidation_InvalidBearerFormat() throws Exception {
        String token = jwtTokenProvider.generateAccessToken(activeUser.getId(), activeUser.getRole());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Token " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("15. JWT Validation Malformed Token - Returns 401 Unauthorized")
    void jwtValidation_MalformedToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("16. JWT Validation Expired Access Token - Returns 401 Unauthorized")
    void jwtValidation_ExpiredAccessToken() throws Exception {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date past = new Date(System.currentTimeMillis() - 10000);

        String expiredToken = Jwts.builder()
                .subject(activeUser.getId().toString())
                .issuedAt(new Date(past.getTime() - 10000))
                .expiration(past)
                .issuer(jwtIssuer)
                .audience().add(jwtAudience).and()
                .claim("role", activeUser.getRole().name())
                .signWith(key, Jwts.SIG.HS256)
                .compact();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("17. JWT Validation Invalid Issuer/Audience - Returns 401 Unauthorized")
    void jwtValidation_InvalidIssuerOrAudience() throws Exception {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();

        String badIssuerToken = Jwts.builder()
                .subject(activeUser.getId().toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + 60000))
                .issuer("untrusted-issuer")
                .audience().add(jwtAudience).and()
                .claim("role", activeUser.getRole().name())
                .signWith(key, Jwts.SIG.HS256)
                .compact();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + badIssuerToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("18. JWT Validation Tampered Signature - Returns 401 Unauthorized")
    void jwtValidation_TamperedSignature() throws Exception {
        SecretKey wrongKey = Keys.hmacShaKeyFor("DifferentSecretKeyWithAtLeast32BytesLength!123".getBytes(StandardCharsets.UTF_8));
        Date now = new Date();

        String tamperedToken = Jwts.builder()
                .subject(activeUser.getId().toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + 60000))
                .issuer(jwtIssuer)
                .audience().add(jwtAudience).and()
                .claim("role", activeUser.getRole().name())
                .signWith(wrongKey, Jwts.SIG.HS256)
                .compact();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    // ==========================================
    // 3. GET /api/v1/auth/me Scenarios
    // ==========================================

    @Test
    @DisplayName("19. GET /auth/me Success - Returns authenticated user response")
    void meEndpoint_Success() throws Exception {
        String token = jwtTokenProvider.generateAccessToken(activeUser.getId(), activeUser.getRole());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(activeUser.getId().toString()))
                .andExpect(jsonPath("$.name").value("Active Farmer"))
                .andExpect(jsonPath("$.email").value("active@farm.com"))
                .andExpect(jsonPath("$.role").value("FARM_OWNER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("20. GET /auth/me Identity Isolation - Strictly derives user from JWT principal")
    void meEndpoint_IdentityIsolatedToSecurityContext() throws Exception {
        User otherUser = new User();
        otherUser.setName("Other Farmer");
        otherUser.setEmail("other@farm.com");
        otherUser.setPasswordHash(passwordEncoder.encode(RAW_PASSWORD));
        otherUser.setRole(UserRole.FARMER);
        otherUser.setStatus(AccountStatus.ACTIVE);
        otherUser = userRepository.save(otherUser);

        String otherToken = jwtTokenProvider.generateAccessToken(otherUser.getId(), otherUser.getRole());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(otherUser.getId().toString()))
                .andExpect(jsonPath("$.email").value("other@farm.com"))
                .andExpect(jsonPath("$.id").value(not(activeUser.getId().toString())));
    }

    @Test
    @DisplayName("21. GET /auth/me Suspended After Login - Returns 403 Forbidden")
    void meEndpoint_AccountSuspendedAfterLogin() throws Exception {
        String token = jwtTokenProvider.generateAccessToken(activeUser.getId(), activeUser.getRole());

        // Suspend user after token issued
        activeUser.setStatus(AccountStatus.SUSPENDED);
        userRepository.save(activeUser);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_SUSPENDED"));
    }

    // ==========================================
    // 4. POST /api/v1/auth/refresh Scenarios
    // ==========================================

    @Test
    @DisplayName("22. Refresh Token Success - Generates new token pair")
    void refreshToken_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(loginResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").value(not(loginResponse.getRefreshToken())));
    }

    @Test
    @DisplayName("23. Refresh Token Rotation - Marks old refresh token as revoked")
    void refreshToken_RotationRevokesOldToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);
        String oldRawToken = loginResponse.getRefreshToken();
        String oldHash = tokenHasher.hashToken(oldRawToken);

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(oldRawToken);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk());

        Optional<RefreshToken> oldTokenOpt = refreshTokenRepository.findByTokenHash(oldHash);
        assertTrue(oldTokenOpt.isPresent());
        assertTrue(oldTokenOpt.get().isRevoked());
        assertNotNull(oldTokenOpt.get().getRevokedAt());
    }

    @Test
    @DisplayName("24. Refresh Token Reuse Rejection - Revoked token cannot be reused")
    void refreshToken_ReuseRevokedToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);
        String oldRawToken = loginResponse.getRefreshToken();

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(oldRawToken);

        // First refresh succeeds
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk());

        // Reusing revoked token fails
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_REVOKED"));
    }

    @Test
    @DisplayName("25. Refresh Token Expired - Expired token returns 401 TOKEN_EXPIRED")
    void refreshToken_ExpiredRefreshToken() throws Exception {
        String rawToken = "expired-token-123";
        String tokenHash = tokenHasher.hashToken(rawToken);

        RefreshToken expiredTokenEntity = new RefreshToken();
        expiredTokenEntity.setUser(activeUser);
        expiredTokenEntity.setTokenHash(tokenHash);
        expiredTokenEntity.setExpiresAt(OffsetDateTime.now().minusDays(1));
        refreshTokenRepository.save(expiredTokenEntity);

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(rawToken);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_EXPIRED"));
    }

    @Test
    @DisplayName("26. Refresh Token Invalid - Unknown raw token returns 401 REFRESH_TOKEN_INVALID")
    void refreshToken_InvalidRefreshToken() throws Exception {
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken("non-existent-token-xyz");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_INVALID"));
    }

    @Test
    @DisplayName("27. Refresh Token Blank - Returns 400 Bad Request")
    void refreshToken_BlankToken() throws Exception {
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken("");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("28. Refresh Token Account Suspended - Returns 403 Forbidden ACCOUNT_SUSPENDED")
    void refreshToken_AccountSuspended() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);

        // Suspend account
        activeUser.setStatus(AccountStatus.SUSPENDED);
        userRepository.save(activeUser);

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(loginResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_SUSPENDED"));
    }

    // ==========================================
    // 5. POST /api/v1/auth/logout Scenarios
    // ==========================================

    @Test
    @DisplayName("29. Logout Success - Revokes refresh token in database")
    void logout_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);
        String rawToken = loginResponse.getRefreshToken();
        String tokenHash = tokenHasher.hashToken(rawToken);

        LogoutRequest logoutRequest = new LogoutRequest();
        logoutRequest.setRefreshToken(rawToken);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHash(tokenHash);
        assertTrue(tokenOpt.isPresent());
        assertTrue(tokenOpt.get().isRevoked());
    }

    @Test
    @DisplayName("30. Logout Idempotent - Second logout with same token returns 200 OK")
    void logout_Idempotent() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);

        LogoutRequest logoutRequest = new LogoutRequest();
        logoutRequest.setRefreshToken(loginResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("31. Logout Revoked Token Cannot Be Refreshed - Returns TOKEN_REVOKED")
    void logout_RevokedTokenCannotBeRefreshed() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@farm.com");
        loginRequest.setPassword(RAW_PASSWORD);

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);

        LogoutRequest logoutRequest = new LogoutRequest();
        logoutRequest.setRefreshToken(loginResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk());

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(loginResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_REVOKED"));
    }

    // ==========================================
    // 6. Protected Route Enforcement Scenarios
    // ==========================================

    @Test
    @DisplayName("32. Protected Route Unauthenticated - Returns 401 Unauthorized for GET /api/v1/users")
    void protectedRoute_UnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    // ==========================================
    // 7. POST /api/v1/users Registration Scenarios
    // ==========================================

    @Test
    @DisplayName("33. Public Registration Success - Unauthenticated POST /api/v1/users returns 201 CREATED")
    void register_UnauthenticatedSuccess() throws Exception {
        CreateUserRequest regReq = new CreateUserRequest();
        regReq.setName("New Registered Farmer");
        regReq.setEmail("registered@farm.com");
        regReq.setPassword("Password123!");
        regReq.setRole(UserRole.FARM_OWNER);

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("New Registered Farmer"))
                .andExpect(jsonPath("$.email").value("registered@farm.com"))
                .andExpect(jsonPath("$.role").value("FARM_OWNER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("34. Public Registration Trailing Slash - Unauthenticated POST /api/v1/users/ returns 201 CREATED")
    void register_TrailingSlashSuccess() throws Exception {
        CreateUserRequest regReq = new CreateUserRequest();
        regReq.setName("Slash Farmer");
        regReq.setEmail("slash@farm.com");
        regReq.setPassword("Password123!");
        regReq.setRole(UserRole.FARMER);

        mockMvc.perform(post("/api/v1/users/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value("slash@farm.com"));
    }

    @Test
    @DisplayName("35. Registration Duplicate Email - Returns 409 Conflict DUPLICATE_RESOURCE")
    void register_DuplicateEmail() throws Exception {
        CreateUserRequest regReq = new CreateUserRequest();
        regReq.setName("Duplicate Farmer");
        regReq.setEmail("active@farm.com"); // already registered in setUp()
        regReq.setPassword("Password123!");
        regReq.setRole(UserRole.FARM_OWNER);

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"));
    }

    @Test
    @DisplayName("36. Registration Blank Fields - Returns 400 Bad Request VALIDATION_ERROR")
    void register_InvalidBlankFields() throws Exception {
        CreateUserRequest regReq = new CreateUserRequest();
        regReq.setName("");
        regReq.setEmail("invalid-email");
        regReq.setPassword("123"); // too short

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}

