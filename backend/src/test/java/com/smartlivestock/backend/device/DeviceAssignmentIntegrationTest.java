package com.smartlivestock.backend.device;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlivestock.backend.animal.dto.CreateAnimalRequest;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.animal.service.AnimalService;
import com.smartlivestock.backend.auth.jwt.JwtTokenProvider;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.device.dto.AssignDeviceRequest;
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

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DeviceAssignmentIntegrationTest {

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
    private AnimalService animalService;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TokenHasher tokenHasher;

    private User testUser;
    private Farm testFarm;
    private String userJwtToken;

    @BeforeEach
    void setUp() {
        deviceRepository.deleteAll();
        animalRepository.deleteAll();
        membershipRepository.deleteAll();
        farmRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Farmer Tejas");
        testUser.setEmail("tejas.test@example.com");
        testUser.setPhone("+919876543210");
        testUser.setPasswordHash("hashed_secret");
        testUser.setRole(UserRole.FARM_OWNER);
        testUser.setStatus(AccountStatus.ACTIVE);
        testUser = userRepository.save(testUser);

        testFarm = new Farm();
        testFarm.setName("Tejas Green Farm");
        testFarm.setDistrict("Kolhapur");
        testFarm.setState("Maharashtra");
        testFarm.setLivestockType(LivestockType.DAIRY);
        testFarm.setStatus(FarmStatus.ACTIVE);
        testFarm = farmRepository.save(testFarm);

        FarmMembership membership = new FarmMembership();
        membership.setFarm(testFarm);
        membership.setUser(testUser);
        membership.setRole(MembershipRole.FARM_OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);

        userJwtToken = jwtTokenProvider.generateAccessToken(testUser.getId(), testUser.getRole());
    }

    @Test
    @DisplayName("Module 3A: Complete workflow - Register unassigned device, create animal, assign device via PUT endpoint")
    void testRegisterAnimalAndAssignDeviceWorkflow() throws Exception {
        // Step 1: Create an unassigned collar in database
        Device device = new Device();
        device.setDeviceIdentifier("ESP32-COLLAR-TEST01");
        device.setApiKeyHash(tokenHasher.hashToken("secret_collar_key"));
        device.setFarm(testFarm);
        device.setStatus("ACTIVE");
        device.setAnimal(null);
        device = deviceRepository.save(device);

        // Verify device is currently unassigned
        mockMvc.perform(get("/api/v1/devices/farm/" + testFarm.getId())
                        .header("Authorization", "Bearer " + userJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].deviceIdentifier", is("ESP32-COLLAR-TEST01")))
                .andExpect(jsonPath("$[0].animalId", nullValue()));

        // Step 2: Create Animal via POST /api/v1/animals
        CreateAnimalRequest createReq = new CreateAnimalRequest();
        createReq.setFarmId(testFarm.getId());
        createReq.setName("Radha");
        createReq.setTagNumber("TAG-999");
        createReq.setSpecies("CATTLE");
        createReq.setBreed("Gir");
        createReq.setGender("FEMALE");

        String animalResponseJson = mockMvc.perform(post("/api/v1/animals")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Radha")))
                .andReturn().getResponse().getContentAsString();

        String createdAnimalId = objectMapper.readTree(animalResponseJson).get("id").asText();
        assertNotNull(createdAnimalId);

        // Step 3: Assign Device to Animal via PUT /api/v1/devices/{id}/assign
        AssignDeviceRequest assignReq = new AssignDeviceRequest();
        assignReq.setAnimalId(UUID.fromString(createdAnimalId));

        mockMvc.perform(put("/api/v1/devices/" + device.getId() + "/assign")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(device.getId().toString())))
                .andExpect(jsonPath("$.animalId", is(createdAnimalId)))
                .andExpect(jsonPath("$.animalName", is("Radha")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        // Step 4: Verify GET /api/v1/devices/animal/{animalId} returns the assigned device
        mockMvc.perform(get("/api/v1/devices/animal/" + createdAnimalId)
                        .header("Authorization", "Bearer " + userJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(device.getId().toString())))
                .andExpect(jsonPath("$.deviceIdentifier", is("ESP32-COLLAR-TEST01")));

        // Step 5: Verify DB state
        Device persistedDevice = deviceRepository.findById(device.getId()).orElseThrow();
        assertNotNull(persistedDevice.getAnimal());
        assertEquals(createdAnimalId, persistedDevice.getAnimal().getId().toString());
    }
}
