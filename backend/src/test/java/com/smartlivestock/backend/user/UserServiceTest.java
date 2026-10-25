package com.smartlivestock.backend.user;

import com.smartlivestock.backend.common.exception.DuplicateResourceException;
import com.smartlivestock.backend.user.dto.CreateUserRequest;
import com.smartlivestock.backend.user.dto.UserResponse;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    @DisplayName("Should create user successfully with hashed password and default active status")
    void shouldCreateUserSuccessfully() {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("Ramesh Patil");
        request.setEmail("ramesh@farm.com");
        request.setPhone("+91 9876543210");
        request.setPassword("SecretPass123");
        request.setRole(UserRole.FARM_OWNER);
        request.setPreferredLanguage("hi");

        UserResponse response = userService.createUser(request);

        assertNotNull(response.getId());
        assertEquals("Ramesh Patil", response.getName());
        assertEquals("ramesh@farm.com", response.getEmail());
        assertEquals(UserRole.FARM_OWNER, response.getRole());
        assertEquals(AccountStatus.ACTIVE, response.getStatus());
        assertEquals("hi", response.getPreferredLanguage());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException on duplicate email creation")
    void shouldPreventDuplicateEmail() {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("Farmer One");
        request.setEmail("duplicate@farm.com");
        request.setPassword("Pass123");
        request.setRole(UserRole.FARMER);

        userService.createUser(request);

        CreateUserRequest duplicateRequest = new CreateUserRequest();
        duplicateRequest.setName("Farmer Two");
        duplicateRequest.setEmail("duplicate@farm.com");
        duplicateRequest.setPassword("Pass456");
        duplicateRequest.setRole(UserRole.FARMER);

        assertThrows(DuplicateResourceException.class, () -> userService.createUser(duplicateRequest));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when public registration attempts ADMIN role")
    void shouldPreventPublicAdminRegistration() {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("Admin Attempt");
        request.setEmail("admin@hack.com");
        request.setPassword("Pass123");
        request.setRole(UserRole.ADMIN);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request));
    }
}
