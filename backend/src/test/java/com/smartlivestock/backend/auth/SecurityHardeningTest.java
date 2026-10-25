package com.smartlivestock.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlivestock.backend.auth.dto.LoginRequest;
import com.smartlivestock.backend.auth.dto.LogoutRequest;
import com.smartlivestock.backend.auth.dto.RefreshTokenRequest;
import com.smartlivestock.backend.auth.jwt.JwtTokenProvider;
import com.smartlivestock.backend.farm.dto.CreateFarmRequest;
import com.smartlivestock.backend.farm.entity.LivestockType;
import com.smartlivestock.backend.farm.service.FarmService;
import com.smartlivestock.backend.user.dto.CreateUserRequest;
import com.smartlivestock.backend.user.dto.UserResponse;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityHardeningTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private FarmService farmService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private UserResponse userA;
    private UserResponse userB;

    @BeforeEach
    void setUp() {
        CreateUserRequest reqA = new CreateUserRequest();
        reqA.setName("User Alpha");
        reqA.setEmail("alpha@security.test");
        reqA.setPassword("Password123");
        reqA.setRole(UserRole.FARM_OWNER);
        userA = userService.createUser(reqA);

        CreateUserRequest reqB = new CreateUserRequest();
        reqB.setName("User Beta");
        reqB.setEmail("beta@security.test");
        reqB.setPassword("Password123");
        reqB.setRole(UserRole.FARM_OWNER);
        userB = userService.createUser(reqB);
    }

    @Test
    @DisplayName("User A cannot access User B's profile (IDOR protection)")
    void shouldPreventCrossUserProfileAccess() throws Exception {
        String tokenA = jwtTokenProvider.generateAccessToken(userA.getId(), userA.getRole());

        mockMvc.perform(get("/api/v1/users/" + userB.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("User A can access own profile")
    void shouldAllowOwnUserProfileAccess() throws Exception {
        String tokenA = jwtTokenProvider.generateAccessToken(userA.getId(), userA.getRole());

        mockMvc.perform(get("/api/v1/users/" + userA.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userA.getId().toString()))
                .andExpect(jsonPath("$.email").value("alpha@security.test"));
    }

    @Test
    @DisplayName("User A cannot access User B's farm (Multi-Tenant Isolation)")
    void shouldPreventCrossUserFarmAccess() throws Exception {
        CreateFarmRequest farmReq = new CreateFarmRequest();
        farmReq.setName("Beta Farm");
        farmReq.setDistrict("Pune");
        farmReq.setState("Maharashtra");
        farmReq.setCountry("India");
        farmReq.setLivestockType(LivestockType.DAIRY);

        var farmB = farmService.createFarm(farmReq, userB.getId());

        String tokenA = jwtTokenProvider.generateAccessToken(userA.getId(), userA.getRole());

        mockMvc.perform(get("/api/v1/farms/" + farmB.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("User A cannot query User B's farm memberships")
    void shouldPreventCrossUserFarmListQuery() throws Exception {
        String tokenA = jwtTokenProvider.generateAccessToken(userA.getId(), userA.getRole());

        mockMvc.perform(get("/api/v1/farms/user/" + userB.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Public ADMIN role registration is rejected with 400 VALIDATION_ERROR")
    void shouldRejectPublicAdminRegistration() throws Exception {
        CreateUserRequest adminReq = new CreateUserRequest();
        adminReq.setName("Malicious Admin");
        adminReq.setEmail("hacker@security.test");
        adminReq.setPassword("Password123");
        adminReq.setRole(UserRole.ADMIN);

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Malformed JWT token produces 401 UNAUTHORIZED")
    void shouldRejectMalformedJwt() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer malformed.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Replay attack on revoked refresh token triggers token family revocation")
    void shouldDetectRefreshReplayAndRevokeTokens() throws Exception {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("alpha@security.test");
        loginReq.setPassword("Password123");

        String loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String rawRefreshToken1 = objectMapper.readTree(loginResult).get("refreshToken").asText();

        // Rotate once
        RefreshTokenRequest refreshReq = new RefreshTokenRequest();
        refreshReq.setRefreshToken(rawRefreshToken1);

        String refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String rawRefreshToken2 = objectMapper.readTree(refreshResult).get("refreshToken").asText();

        // Replay rotated token 1 -> should fail with 401 TOKEN_REVOKED
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_REVOKED"));

        // Verify rotated token 2 was also invalidated due to replay detection
        RefreshTokenRequest refreshReq2 = new RefreshTokenRequest();
        refreshReq2.setRefreshToken(rawRefreshToken2);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq2)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_REVOKED"));
    }

    @Test
    @DisplayName("Logout is idempotent and safe to call repeatedly")
    void shouldBeSafeToLogoutRepeatedly() throws Exception {
        LogoutRequest logoutReq = new LogoutRequest();
        logoutReq.setRefreshToken("non-existent-token");

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutReq)))
                .andExpect(status().isOk());
    }
}
