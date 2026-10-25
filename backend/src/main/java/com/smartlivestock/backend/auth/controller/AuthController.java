package com.smartlivestock.backend.auth.controller;

import com.smartlivestock.backend.auth.dto.AuthResponse;
import com.smartlivestock.backend.auth.dto.LoginRequest;
import com.smartlivestock.backend.auth.dto.LogoutRequest;
import com.smartlivestock.backend.auth.dto.RefreshTokenRequest;
import com.smartlivestock.backend.auth.service.AuthService;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new AuthException("UNAUTHORIZED", "Authentication context missing", 401);
        }

        Object principal = authentication.getPrincipal();
        UUID userId;
        try {
            if (principal instanceof UUID) {
                userId = (UUID) principal;
            } else {
                userId = UUID.fromString(principal.toString());
            }
        } catch (IllegalArgumentException e) {
            throw new AuthException("UNAUTHORIZED", "Invalid user identity in security context", 401);
        }

        UserResponse response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(response);
    }
}
