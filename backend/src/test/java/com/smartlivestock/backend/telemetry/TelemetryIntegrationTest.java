package com.smartlivestock.backend.telemetry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.auth.jwt.JwtTokenProvider;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.device.repository.DeviceRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TelemetryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private FarmMembershipRepository membershipRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TokenHasher tokenHasher;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private Farm testFarm;
    private Animal testAnimal;
    private Device testDevice;
    private String jwtToken;
    private final String rawApiKey = "secret-device-api-key-123";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setName("Ramesh Patil");
        testUser.setEmail("ramesh@farm.com");
        testUser.setPasswordHash("hashed_password");
        testUser.setRole(UserRole.FARM_OWNER);
        testUser.setStatus(AccountStatus.ACTIVE);
        testUser = userRepository.save(testUser);

        jwtToken = jwtTokenProvider.generateAccessToken(testUser.getId(), testUser.getRole());

        testFarm = new Farm();
        testFarm.setName("Patil Dairy Farm");
        testFarm.setLivestockType(LivestockType.DAIRY);
        testFarm.setStatus(FarmStatus.ACTIVE);
        testFarm = farmRepository.save(testFarm);

        FarmMembership membership = new FarmMembership();
        membership.setFarm(testFarm);
        membership.setUser(testUser);
        membership.setRole(MembershipRole.FARM_OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        testAnimal = new Animal();
        testAnimal.setFarm(testFarm);
        testAnimal.setName("Gauri");
        testAnimal.setTagNumber("C-101");
        testAnimal.setSpecies("CATTLE");
        testAnimal.setBreed("Gir");
        testAnimal.setStatus("HEALTHY");
        testAnimal = animalRepository.save(testAnimal);

        testDevice = new Device();
        testDevice.setDeviceIdentifier("ESP32-COLLAR-001");
        testDevice.setApiKeyHash(tokenHasher.hashToken(rawApiKey));
        testDevice.setFarm(testFarm);
        testDevice.setAnimal(testAnimal);
        testDevice.setStatus("ACTIVE");
        testDevice = deviceRepository.save(testDevice);
    }

    @Test
    @DisplayName("Should successfully ingest valid DS18B20 temperature reading from ESP32 via X-API-KEY header")
    void shouldIngestValidTelemetryData() throws Exception {
        SensorUploadRequest request = new SensorUploadRequest();
        request.setDeviceId("ESP32-COLLAR-001");
        request.setTemperature(38.5);
        request.setMeasuredAt(Instant.now());

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .header("X-API-KEY", rawApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.temperature").value(38.5))
                .andExpect(jsonPath("$.deviceIdentifier").value("ESP32-COLLAR-001"))
                .andExpect(jsonPath("$.animalName").value("Gauri"));
    }

    @Test
    @DisplayName("Should reject telemetry upload when X-API-KEY header is missing")
    void shouldRejectMissingApiKeyHeader() throws Exception {
        SensorUploadRequest request = new SensorUploadRequest();
        request.setDeviceId("ESP32-COLLAR-001");
        request.setTemperature(38.5);

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject telemetry upload when key is supplied only in JSON body without X-API-KEY header")
    void shouldRejectApiKeySuppliedOnlyInBody() throws Exception {
        String jsonWithBodyKey = "{\"deviceId\":\"ESP32-COLLAR-001\",\"apiKey\":\"" + rawApiKey + "\",\"temperature\":38.5}";

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWithBodyKey))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject DS18B20 disconnected sentinel value (-127°C) with HTTP 400 Bad Request")
    void shouldRejectDisconnectedSensorSentinel() throws Exception {
        SensorUploadRequest request = new SensorUploadRequest();
        request.setDeviceId("ESP32-COLLAR-001");
        request.setTemperature(-127.0);

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .header("X-API-KEY", rawApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid sensor reading: DS18B20 sensor disconnected (-127°C)"));
    }

    @Test
    @DisplayName("Should reject telemetry upload with invalid device X-API-KEY header")
    void shouldRejectInvalidApiKey() throws Exception {
        SensorUploadRequest request = new SensorUploadRequest();
        request.setDeviceId("ESP32-COLLAR-001");
        request.setTemperature(38.5);

        mockMvc.perform(post("/api/v1/sensors/upload")
                        .header("X-API-KEY", "wrong-api-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should retrieve latest telemetry for authorized farmer")
    void shouldRetrieveLatestTelemetry() throws Exception {
        // First ingest a reading
        SensorUploadRequest upload = new SensorUploadRequest();
        upload.setDeviceId("ESP32-COLLAR-001");
        upload.setTemperature(38.6);
        upload.setMeasuredAt(Instant.now());

        mockMvc.perform(post("/api/v1/sensors/upload")
                .header("X-API-KEY", rawApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(upload)));

        // Retrieve telemetry
        mockMvc.perform(get("/api/v1/telemetry/latest/" + testAnimal.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.temperature").value(38.6))
                .andExpect(jsonPath("$.movementAvailable").value(false))
                .andExpect(jsonPath("$.movementStatus").value("COMING_SOON"));
    }
}
