package com.smartlivestock.backend.notification;

import com.smartlivestock.backend.alert.entity.Alert;

import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.entity.LivestockType;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.membership.entity.FarmMembership;
import com.smartlivestock.backend.membership.entity.MembershipRole;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.notification.dto.RegisterPushTokenRequest;
import com.smartlivestock.backend.notification.entity.PushToken;
import com.smartlivestock.backend.notification.repository.PushTokenRepository;
import com.smartlivestock.backend.notification.service.ExpoPushNotificationService;
import com.smartlivestock.backend.notification.service.PushNotificationService;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ExpoPushNotificationTest {

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private ExpoPushNotificationService expoPushNotificationService;

    @Autowired
    private PushTokenRepository pushTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private FarmMembershipRepository membershipRepository;

    private User testUser;
    private Farm testFarm;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setName("Sanjay Patil");
        testUser.setEmail("sanjay@farm.com");
        testUser.setPasswordHash("hashed");
        testUser.setRole(UserRole.FARM_OWNER);
        testUser.setStatus(AccountStatus.ACTIVE);
        testUser = userRepository.save(testUser);

        testFarm = new Farm();
        testFarm.setName("Sanjay Dairy");
        testFarm.setLivestockType(LivestockType.DAIRY);
        testFarm.setStatus(FarmStatus.ACTIVE);
        testFarm = farmRepository.save(testFarm);

        FarmMembership membership = new FarmMembership();
        membership.setFarm(testFarm);
        membership.setUser(testUser);
        membership.setRole(MembershipRole.FARM_OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);
    }

    @Test
    @DisplayName("Should successfully register and associate Expo push token with user")
    void testRegisterPushToken() {
        RegisterPushTokenRequest req = new RegisterPushTokenRequest();
        req.setToken("ExponentPushToken[AbCdEf123456]");
        req.setPlatform("ANDROID");

        pushNotificationService.registerToken(req, testUser.getId());

        List<PushToken> tokens = pushTokenRepository.findByUserId(testUser.getId());
        assertEquals(1, tokens.size());
        assertEquals("ExponentPushToken[AbCdEf123456]", tokens.get(0).getToken());
        assertEquals("ANDROID", tokens.get(0).getPlatform());
    }

    @Test
    @DisplayName("Should handle push notification dispatch asynchronously without failing when endpoint is unverified")
    void testPushNotificationDispatchSafety() {
        RegisterPushTokenRequest req = new RegisterPushTokenRequest();
        req.setToken("ExponentPushToken[TestToken999]");
        req.setPlatform("ANDROID");
        pushNotificationService.registerToken(req, testUser.getId());

        Alert alert = new Alert();
        alert.setFarm(testFarm);
        alert.setAlertType("HIGH_TEMPERATURE");
        alert.setSeverity("CRITICAL");
        alert.setTitle("High Temperature Alert");
        alert.setMessage("Cattle temperature reached 40.1°C");
        alert.setIsRead(false);
        alert.setCreatedAt(Instant.now());

        // Call dispatch - must execute without throwing exception
        assertDoesNotThrow(() -> expoPushNotificationService.sendPushNotificationForAlert(alert));
    }
}
