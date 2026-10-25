package com.smartlivestock.backend.telemetry.controller;

import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.telemetry.dto.SensorUploadRequest;
import com.smartlivestock.backend.telemetry.dto.TelemetryResponse;
import com.smartlivestock.backend.telemetry.service.TelemetryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class TelemetryController {

    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
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

    /**
     * IoT Public Sensor Ingestion Endpoint.
     * Authenticated exclusively via X-API-KEY HTTP header.
     */
    @PostMapping("/sensors/upload")
    public ResponseEntity<TelemetryResponse> uploadSensorData(
            @Valid @RequestBody SensorUploadRequest request,
            @RequestHeader(value = "X-API-KEY", required = false) String headerApiKey
    ) {
        TelemetryResponse response = telemetryService.ingestSensorData(request, headerApiKey);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/telemetry/latest/{animalId}")
    public ResponseEntity<TelemetryResponse> getLatestTelemetry(@PathVariable UUID animalId) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        TelemetryResponse response = telemetryService.getLatestTelemetry(animalId, authenticatedUserId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/telemetry/history/{animalId}")
    public ResponseEntity<List<TelemetryResponse>> getTelemetryHistory(
            @PathVariable UUID animalId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        UUID authenticatedUserId = getAuthenticatedUserId();
        List<TelemetryResponse> response = telemetryService.getTelemetryHistory(animalId, limit, authenticatedUserId);
        return ResponseEntity.ok(response);
    }
}
