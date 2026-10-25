package com.smartlivestock.backend.farm.controller;

import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.farm.dto.CreateFarmRequest;
import com.smartlivestock.backend.farm.dto.FarmResponse;
import com.smartlivestock.backend.farm.service.FarmService;
import com.smartlivestock.backend.membership.dto.FarmMembershipResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/farms")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new AuthException("UNAUTHORIZED", "Authentication required", 401);
        }
        Object principal = auth.getPrincipal();
        try {
            if (principal instanceof UUID) {
                return (UUID) principal;
            }
            return UUID.fromString(principal.toString());
        } catch (IllegalArgumentException e) {
            throw new AuthException("UNAUTHORIZED", "Invalid user identity", 401);
        }
    }

    @PostMapping
    public ResponseEntity<FarmResponse> createFarm(@Valid @RequestBody CreateFarmRequest request) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        FarmResponse response = farmService.createFarm(request, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<FarmMembershipResponse>> getMyFarms() {
        UUID authenticatedUserId = getAuthenticatedUserId();
        List<FarmMembershipResponse> response = farmService.getUserFarms(authenticatedUserId, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmResponse> getFarmById(@PathVariable UUID id) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        FarmResponse response = farmService.getFarmById(id, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FarmMembershipResponse>> getUserFarms(@PathVariable UUID userId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        List<FarmMembershipResponse> response = farmService.getUserFarms(userId, authenticatedUserId);
        return ResponseEntity.ok(response);
    }
}
