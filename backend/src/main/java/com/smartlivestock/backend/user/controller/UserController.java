package com.smartlivestock.backend.user.controller;

import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.user.dto.CreateUserRequest;
import com.smartlivestock.backend.user.dto.UserResponse;
import com.smartlivestock.backend.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/users", "/api/v1/users/"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new AuthException("UNAUTHORIZED", "Authentication required", 401);
        }
        UUID authenticatedUserId;
        try {
            Object principal = auth.getPrincipal();
            authenticatedUserId = (principal instanceof UUID) ? (UUID) principal : UUID.fromString(principal.toString());
        } catch (Exception e) {
            throw new AuthException("UNAUTHORIZED", "Invalid user identity", 401);
        }

        if (!authenticatedUserId.equals(id)) {
            throw new AuthException("FORBIDDEN", "Access to user profile denied", 403);
        }

        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }
}
