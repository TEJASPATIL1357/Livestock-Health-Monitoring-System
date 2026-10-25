package com.smartlivestock.backend.migration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlivestock.backend.animal.dto.CreateAnimalRequest;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.animal.service.AnimalService;
import com.smartlivestock.backend.auth.jwt.JwtTokenProvider;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.common.exception.DuplicateResourceException;
import com.smartlivestock.backend.device.dto.DeviceResponse;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.device.repository.DeviceRepository;
import com.smartlivestock.backend.device.service.DeviceService;
import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.entity.LivestockType;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.membership.entity.FarmMembership;
import com.smartlivestock.backend.membership.entity.MembershipRole;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.telemetry.dto.SensorUploadRequest;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.flywaydb.core.Flyway;
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

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class V3MigrationAndRemediationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AnimalService animalService;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private FarmMembershipRepository membershipRepository;

    @Autowired
    private TokenHasher tokenHasher;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private Farm testFarm;
    private String jwtToken;
    private final String rawApiKey = "test-device-key-999";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setName("Vikram Patil");
        testUser.setEmail("vikram@farm.com");
        testUser.setPasswordHash("hashed");
        testUser.setRole(UserRole.FARM_OWNER);
        testUser.setStatus(AccountStatus.ACTIVE);
        testUser = userRepository.save(testUser);

        jwtToken = jwtTokenProvider.generateAccessToken(testUser.getId(), testUser.getRole());

        testFarm = new Farm();
        testFarm.setName("Vikram Dairy");
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
    @DisplayName("Should verify Flyway migration V3 is successfully applied")
    void testFlywayV3Applied() {
        assertNotNull(flyway);
        var info = flyway.info();
        boolean v3Applied = java.util.Arrays.stream(info.applied())
                .anyMatch(m -> "3".equals(m.getVersion().getVersion()));
        assertTrue(v3Applied, "Flyway V3 should be applied");
    }

    @Test
    @DisplayName("Should permit registering multiple animals without tags while enforcing uniqueness on non-null tags")
    void testNullableTagUniqueness() {
        // Register animal 1 with null tag
        CreateAnimalRequest req1 = new CreateAnimalRequest();
        req1.setFarmId(testFarm.getId());
        req1.setName("Calf 1");
        req1.setTagNumber(null);
        var animal1 = animalService.createAnimal(req1, testUser.getId());
        assertNotNull(animal1.getId());
        assertNull(animal1.getTagNumber());

        // Register animal 2 with null tag (must succeed)
        CreateAnimalRequest req2 = new CreateAnimalRequest();
        req2.setFarmId(testFarm.getId());
        req2.setName("Calf 2");
        req2.setTagNumber(null);
        var animal2 = animalService.createAnimal(req2, testUser.getId());
        assertNotNull(animal2.getId());

        // Register animal 3 with tag "#TAG-777"
        CreateAnimalRequest req3 = new CreateAnimalRequest();
        req3.setFarmId(testFarm.getId());
        req3.setName("Radha");
        req3.setTagNumber("#TAG-777");
        animalService.createAnimal(req3, testUser.getId());

        // Register animal 4 with duplicate tag "#TAG-777" (must throw DuplicateResourceException)
        CreateAnimalRequest req4 = new CreateAnimalRequest();
        req4.setFarmId(testFarm.getId());
        req4.setName("Savitri");
        req4.setTagNumber("#TAG-777");
        assertThrows(DuplicateResourceException.class, () -> animalService.createAnimal(req4, testUser.getId()));
    }

    @Test
    @DisplayName("Should revoke device and block revoked device telemetry uploads")
    void testDeviceRevocation() throws Exception {
        Animal animal = new Animal();
        animal.setFarm(testFarm);
        animal.setName("Bhavani");
        animal.setSpecies("CATTLE");
        animal.setStatus("HEALTHY");
        animal = animalRepository.save(animal);

        Device device = new Device();
        device.setDeviceIdentifier("ESP32-REVOKE-01");
        device.setApiKeyHash(tokenHasher.hashToken(rawApiKey));
        device.setFarm(testFarm);
        device.setAnimal(animal);
        device.setStatus("ACTIVE");
        device = deviceRepository.save(device);

        // Revoke device via API
        mockMvc.perform(post("/api/v1/devices/" + device.getId() + "/revoke")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Attempt sensor upload with revoked device (must return HTTP 401 Unauthorized)
        SensorUploadRequest upload = new SensorUploadRequest();
        upload.setDeviceId("ESP32-REVOKE-01");
        upload.setTemperature(38.5);

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .header("X-API-KEY", rawApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(upload)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should rotate device API key and invalidate old API key")
    void testDeviceKeyRotation() throws Exception {
        Device device = new Device();
        device.setDeviceIdentifier("ESP32-ROTATE-01");
        device.setApiKeyHash(tokenHasher.hashToken(rawApiKey));
        device.setFarm(testFarm);
        device.setStatus("ACTIVE");
        device = deviceRepository.save(device);

        // Rotate key via API
        String responseStr = mockMvc.perform(post("/api/v1/devices/" + device.getId() + "/rotate-key")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        DeviceResponse response = objectMapper.readValue(responseStr, DeviceResponse.class);
        assertNotNull(response.getProvisioningApiKey());
        assertNotEquals(rawApiKey, response.getProvisioningApiKey());
        assertNotNull(response.getLastRotatedAt());

        // Attempt upload with OLD key (must fail with 401)
        SensorUploadRequest oldUpload = new SensorUploadRequest();
        oldUpload.setDeviceId("ESP32-ROTATE-01");
        oldUpload.setTemperature(38.5);

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .header("X-API-KEY", rawApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldUpload)))
                .andExpect(status().isUnauthorized());
    }
}
