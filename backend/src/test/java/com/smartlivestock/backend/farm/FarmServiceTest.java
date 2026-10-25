package com.smartlivestock.backend.farm;

import com.smartlivestock.backend.farm.dto.CreateFarmRequest;
import com.smartlivestock.backend.farm.dto.FarmResponse;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.entity.LivestockType;
import com.smartlivestock.backend.farm.service.FarmService;
import com.smartlivestock.backend.membership.dto.FarmMembershipResponse;
import com.smartlivestock.backend.membership.entity.MembershipRole;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.user.dto.CreateUserRequest;
import com.smartlivestock.backend.user.dto.UserResponse;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FarmServiceTest {

    @Autowired
    private FarmService farmService;

    @Autowired
    private UserService userService;

    @Test
    @DisplayName("Should create farm and automatically assign creator as FARM_OWNER in same transaction")
    void shouldCreateFarmWithOwnershipMembership() {
        // Create user
        CreateUserRequest userReq = new CreateUserRequest();
        userReq.setName("Owner User");
        userReq.setEmail("owner@dairy.com");
        userReq.setPassword("Password123");
        userReq.setRole(UserRole.FARM_OWNER);
        UserResponse userResp = userService.createUser(userReq);

        // Create farm
        CreateFarmRequest farmReq = new CreateFarmRequest();
        farmReq.setOwnerUserId(userResp.getId());
        farmReq.setName("Green Meadows Farm");
        farmReq.setDistrict("Kolhapur");
        farmReq.setState("Maharashtra");
        farmReq.setCountry("India");
        farmReq.setLivestockType(LivestockType.DAIRY);

        FarmResponse farmResp = farmService.createFarm(farmReq);

        assertNotNull(farmResp.getId());
        assertEquals("Green Meadows Farm", farmResp.getName());
        assertEquals(FarmStatus.ACTIVE, farmResp.getStatus());

        // Verify membership created automatically
        List<FarmMembershipResponse> userFarms = farmService.getUserFarms(userResp.getId());
        assertEquals(1, userFarms.size());
        assertEquals(farmResp.getId(), userFarms.get(0).getFarmId());
        assertEquals(MembershipRole.FARM_OWNER, userFarms.get(0).getRole());
        assertEquals(MembershipStatus.ACTIVE, userFarms.get(0).getStatus());
    }
}
