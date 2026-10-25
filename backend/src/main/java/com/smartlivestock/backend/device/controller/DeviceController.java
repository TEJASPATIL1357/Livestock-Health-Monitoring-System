package com.smartlivestock.backend.device.controller;

import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.device.dto.AssignDeviceRequest;
import com.smartlivestock.backend.device.dto.DeviceResponse;
import com.smartlivestock.backend.device.dto.RegisterDeviceRequest;
import com.smartlivestock.backend.device.service.DeviceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
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

    @PostMapping("/register")
    public ResponseEntity<DeviceResponse> registerDevice(@Valid @RequestBody RegisterDeviceRequest request) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        DeviceResponse response = deviceService.registerDevice(request, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<DeviceResponse> assignDevice(
            @PathVariable UUID id,
            @RequestBody AssignDeviceRequest request
    ) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        DeviceResponse response = deviceService.assignDeviceToAnimal(id, request, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<DeviceResponse>> getDevicesByFarm(@PathVariable UUID farmId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        List<DeviceResponse> response = deviceService.getDevicesByFarm(farmId, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<DeviceResponse> getDeviceForAnimal(@PathVariable UUID animalId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        DeviceResponse response = deviceService.getDeviceForAnimal(animalId, authenticatedUserId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<DeviceResponse> revokeDevice(@PathVariable UUID id) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        DeviceResponse response = deviceService.revokeDevice(id, authenticatedUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/rotate-key")
    public ResponseEntity<DeviceResponse> rotateDeviceKey(@PathVariable UUID id) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        DeviceResponse response = deviceService.rotateDeviceKey(id, authenticatedUserId);
        return ResponseEntity.ok(response);
    }
}
