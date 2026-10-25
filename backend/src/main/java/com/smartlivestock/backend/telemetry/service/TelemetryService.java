package com.smartlivestock.backend.telemetry.service;

import com.smartlivestock.backend.ai.service.AiHealthIntelligenceService;
import com.smartlivestock.backend.alert.service.AlertService;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.device.service.DeviceService;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.telemetry.dto.SensorUploadRequest;
import com.smartlivestock.backend.telemetry.dto.TelemetryResponse;
import com.smartlivestock.backend.telemetry.entity.SensorTelemetry;
import com.smartlivestock.backend.telemetry.repository.SensorTelemetryRepository;
import org.springframework.data.domain.PageRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TelemetryService {

    private final SensorTelemetryRepository telemetryRepository;
    private final DeviceService deviceService;
    private final AnimalRepository animalRepository;
    private final FarmMembershipRepository membershipRepository;
    private final AiHealthIntelligenceService aiHealthIntelligenceService;
    private final AlertService alertService;

    public TelemetryService(
            SensorTelemetryRepository telemetryRepository,
            DeviceService deviceService,
            AnimalRepository animalRepository,
            FarmMembershipRepository membershipRepository,
            AiHealthIntelligenceService aiHealthIntelligenceService,
            AlertService alertService
    ) {
        this.telemetryRepository = telemetryRepository;
        this.deviceService = deviceService;
        this.animalRepository = animalRepository;
        this.membershipRepository = membershipRepository;
        this.aiHealthIntelligenceService = aiHealthIntelligenceService;
        this.alertService = alertService;
    }

    private void verifyFarmMembership(UUID farmId, UUID userId) {
        boolean isMember = membershipRepository.existsByFarmIdAndUserIdAndStatus(
                farmId, userId, MembershipStatus.ACTIVE
        );
        if (!isMember) {
            throw new AuthException("FORBIDDEN", "Access to telemetry denied", 403);
        }
    }

    @Transactional
    public TelemetryResponse ingestSensorData(SensorUploadRequest request, String headerApiKey) {
        String deviceIdentifier = request.getEffectiveDeviceId();
        if (deviceIdentifier == null || deviceIdentifier.isBlank()) {
            throw new AuthException("BAD_REQUEST", "Missing device identifier (deviceId or deviceIdentifier)", 400);
        }
        if (headerApiKey == null || headerApiKey.isBlank()) {
            throw new AuthException("UNAUTHORIZED", "Missing device API key in X-API-KEY header", 401);
        }

        // Authenticate device
        Device device = deviceService.authenticateDevice(deviceIdentifier, headerApiKey);

        // Check assigned animal
        if (device.getAnimal() == null) {
            throw new AuthException("BAD_REQUEST", "Device " + deviceIdentifier + " is unassigned to any animal", 400);
        }

        Double temp = request.getTemperature();
        if (temp == null) {
            throw new AuthException("BAD_REQUEST", "Temperature value is required", 400);
        }

        // Rejection rule: DS18B20 disconnected sentinel (-127.0°C)
        if (Math.abs(temp - (-127.0)) < 0.1) {
            throw new AuthException("BAD_REQUEST", "Invalid sensor reading: DS18B20 sensor disconnected (-127°C)", 400);
        }

        // Physical bounds check (0°C to 60°C for livestock body temperature)
        if (temp < 0.0 || temp > 60.0) {
            throw new AuthException("BAD_REQUEST", "Invalid temperature reading out of physical bounds: " + temp + "°C", 400);
        }

        Instant measuredAt = request.getMeasuredAt() != null ? request.getMeasuredAt() : Instant.now();
        if (measuredAt.isAfter(Instant.now().plusSeconds(60))) {
            measuredAt = Instant.now();
        }

        // Idempotency check: skip if duplicate timestamp for same device
        if (telemetryRepository.existsByDeviceIdAndMeasuredAt(device.getId(), measuredAt)) {
            SensorTelemetry existing = telemetryRepository.findByAnimalIdOrderByIngestedAtDesc(device.getAnimal().getId(), PageRequest.of(0, 1))
                    .stream().findFirst().orElse(null);
            if (existing != null) {
                return TelemetryResponse.fromEntity(existing);
            }
        }

        SensorTelemetry telemetry = new SensorTelemetry();
        telemetry.setDevice(device);
        telemetry.setAnimal(device.getAnimal());
        telemetry.setFarm(device.getFarm());
        telemetry.setTemperature(temp);
        telemetry.setMeasuredAt(measuredAt);
        telemetry.setIngestedAt(Instant.now());

        boolean hasMovement = request.getAccelX() != null
                || request.getAccelY() != null
                || request.getAccelZ() != null
                || request.getGyroX() != null
                || request.getGyroY() != null
                || request.getGyroZ() != null;

        telemetry.setMovementAvailable(hasMovement);
        if (hasMovement) {
            telemetry.setAccelX(request.getAccelX());
            telemetry.setAccelY(request.getAccelY());
            telemetry.setAccelZ(request.getAccelZ());
            telemetry.setGyroX(request.getGyroX());
            telemetry.setGyroY(request.getGyroY());
            telemetry.setGyroZ(request.getGyroZ());
        }

        device.setLastSeenAt(Instant.now());
        boolean wasOffline = "OFFLINE".equalsIgnoreCase(device.getStatus()) || "UNCONNECTED".equalsIgnoreCase(device.getStatus());
        if (wasOffline) {
            device.setStatus("ACTIVE");
            alertService.resolveOfflineAlertsForDevice(device);
        }
        deviceService.saveDevice(device);

        SensorTelemetry saved = telemetryRepository.save(telemetry);

        // Trigger automatic AI assessment update
        aiHealthIntelligenceService.evaluateAnimalHealth(device.getAnimal(), Duration.ofHours(24));

        return TelemetryResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public TelemetryResponse getLatestTelemetry(UUID animalId, UUID authenticatedUserId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with id: " + animalId));

        verifyFarmMembership(animal.getFarm().getId(), authenticatedUserId);

        SensorTelemetry telemetry = telemetryRepository.findTopByAnimalIdOrderByIngestedAtDesc(animalId)
                .orElse(null);

        if (telemetry == null) {
            return null;
        }

        return TelemetryResponse.fromEntity(telemetry);
    }

    @Transactional(readOnly = true)
    public List<TelemetryResponse> getTelemetryHistory(UUID animalId, int limit, UUID authenticatedUserId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with id: " + animalId));

        verifyFarmMembership(animal.getFarm().getId(), authenticatedUserId);

        int boundedLimit = Math.min(Math.max(limit, 1), 100);
        return telemetryRepository.findByAnimalIdOrderByIngestedAtDesc(animalId, PageRequest.of(0, boundedLimit)).stream()
                .map(TelemetryResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
