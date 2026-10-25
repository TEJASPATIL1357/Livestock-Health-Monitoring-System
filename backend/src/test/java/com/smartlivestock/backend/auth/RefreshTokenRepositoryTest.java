package com.smartlivestock.backend.auth;

import com.smartlivestock.backend.auth.entity.RefreshToken;
import com.smartlivestock.backend.auth.repository.RefreshTokenRepository;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RefreshTokenRepositoryTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenHasher tokenHasher;

    @Test
    @DisplayName("Should store SHA-256 hashed refresh token securely and check revocation/expiration")
    void shouldStoreHashedRefreshTokenSecurely() {
        User user = new User();
        user.setName("Token User");
        user.setEmail("token@farm.com");
        user.setPasswordHash("hash123");
        user.setRole(UserRole.FARMER);
        user.setStatus(AccountStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        String rawToken = "raw_sample_refresh_token_string_12345";
        String hashedToken = tokenHasher.hashToken(rawToken);

        RefreshToken token = new RefreshToken();
        token.setUser(savedUser);
        token.setTokenHash(hashedToken);
        token.setExpiresAt(OffsetDateTime.now().plusDays(7));
        token.setDeviceInfo("Pixel 8 Android 14 App");

        RefreshToken savedToken = refreshTokenRepository.save(token);
        assertNotNull(savedToken.getId());
        assertFalse(savedToken.isExpired());
        assertFalse(savedToken.isRevoked());

        Optional<RefreshToken> found = refreshTokenRepository.findByTokenHash(hashedToken);
        assertTrue(found.isPresent());
        assertEquals(savedUser.getId(), found.get().getUser().getId());
        assertNotEquals(rawToken, found.get().getTokenHash());
    }
}
