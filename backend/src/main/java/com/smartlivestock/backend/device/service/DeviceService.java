package com.smartlivestock.backend.device.service;

import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.common.exception.DuplicateResourceException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.device.dto.AssignDeviceRequest;
import com.smartlivestock.backend.device.dto.DeviceResponse;
import com.smartlivestock.backend.device.dto.RegisterDeviceRequest;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.device.repository.DeviceRepository;
import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final FarmRepository farmRepository;
    private final AnimalRepository animalRepository;
    private final FarmMembershipRepository membershipRepository;
    private final TokenHasher tokenHasher;

    public DeviceService(
            DeviceRepository deviceRepository,
            FarmRepository farmRepository,
            AnimalRepository animalRepository,
            FarmMembershipRepository membershipRepository,
            TokenHasher tokenHasher
    ) {
        this.deviceRepository = deviceRepository;
        this.farmRepository = farmRepository;
        this.animalRepository = animalRepository;
        this.membershipRepository = membershipRepository;
        this.tokenHasher = tokenHasher;
    }

    private void verifyFarmMembership(UUID farmId, UUID userId) {
        boolean isMember = membershipRepository.existsByFarmIdAndUserIdAndStatus(
                farmId, userId, MembershipStatus.ACTIVE
        );
        if (!isMember) {
            throw new AuthException("FORBIDDEN", "Access to farm devices denied", 403);
        }
    }

    @Transactional
    public DeviceResponse registerDevice(RegisterDeviceRequest request, UUID authenticatedUserId) {
        verifyFarmMembership(request.getFarmId(), authenticatedUserId);

        if (deviceRepository.existsByDeviceIdentifier(request.getDeviceIdentifier())) {
            throw new DuplicateResourceException("Device identifier " + request.getDeviceIdentifier() + " is already registered");
        }

        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + request.getFarmId()));

        Animal animal = null;
        if (request.getAnimalId() != null) {
            animal = animalRepository.findByIdAndFarmId(request.getAnimalId(), request.getFarmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Animal not found or does not belong to farm: " + request.getAnimalId()));

            // Check if animal already has an active device
            deviceRepository.findByAnimalId(request.getAnimalId()).ifPresent(d -> {
                throw new DuplicateResourceException("Animal " + request.getAnimalId() + " already has an assigned device (" + d.getDeviceIdentifier() + ")");
            });
        }

        String apiKeyHash = tokenHasher.hashToken(request.getApiKey());

        Device device = new Device();
        device.setDeviceIdentifier(request.getDeviceIdentifier());
        device.setApiKeyHash(apiKeyHash);
        device.setFarm(farm);
        device.setAnimal(animal);
        device.setStatus("ACTIVE");

        Device saved = deviceRepository.save(device);
        return DeviceResponse.fromEntity(saved);
    }

    @Transactional
    public DeviceResponse assignDeviceToAnimal(UUID deviceId, AssignDeviceRequest request, UUID authenticatedUserId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

        verifyFarmMembership(device.getFarm().getId(), authenticatedUserId);

        if (request.getAnimalId() == null) {
            device.setAnimal(null);
            device.setStatus("UNASSIGNED");
        } else {
            Animal animal = animalRepository.findByIdAndFarmId(request.getAnimalId(), device.getFarm().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Animal not found in this farm: " + request.getAnimalId()));

            // Unassign previous device for this animal if any
            deviceRepository.findByAnimalId(request.getAnimalId()).ifPresent(existing -> {
                if (!existing.getId().equals(deviceId)) {
                    existing.setAnimal(null);
                    existing.setStatus("UNASSIGNED");
                    deviceRepository.save(existing);
                }
            });

            device.setAnimal(animal);
            device.setStatus("ACTIVE");
        }

        Device updated = deviceRepository.save(device);
        return DeviceResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> getDevicesByFarm(UUID farmId, UUID authenticatedUserId) {
        verifyFarmMembership(farmId, authenticatedUserId);
        return deviceRepository.findByFarmId(farmId).stream()
                .map(DeviceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeviceResponse getDeviceForAnimal(UUID animalId, UUID authenticatedUserId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with id: " + animalId));

        verifyFarmMembership(animal.getFarm().getId(), authenticatedUserId);

        Device device = deviceRepository.findByAnimalId(animalId)
                .orElse(null);

        return device != null ? DeviceResponse.fromEntity(device) : null;
    }

    /**
     * Internal method for verifying ESP32 device authorization via identifier & raw API key.
     */
    @Transactional
    public Device authenticateDevice(String deviceIdentifier, String rawApiKey) {
        Device device = deviceRepository.findByDeviceIdentifier(deviceIdentifier)
                .orElseThrow(() -> new AuthException("UNAUTHORIZED", "Unregistered device: " + deviceIdentifier, 401));

        if (device.getRevokedAt() != null || "REVOKED".equalsIgnoreCase(device.getStatus())) {
            throw new AuthException("UNAUTHORIZED", "Device credential has been revoked: " + deviceIdentifier, 401);
        }

        String expectedHash = tokenHasher.hashToken(rawApiKey);
        if (!device.getApiKeyHash().equals(expectedHash)) {
            throw new AuthException("UNAUTHORIZED", "Invalid device API key", 401);
        }

        device.setLastSeenAt(Instant.now());
        return deviceRepository.save(device);
    }

    @Transactional
    public DeviceResponse revokeDevice(UUID deviceId, UUID authenticatedUserId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

        verifyFarmMembership(device.getFarm().getId(), authenticatedUserId);

        device.setStatus("REVOKED");
        device.setRevokedAt(Instant.now());
        device.setAnimal(null);

        Device saved = deviceRepository.save(device);
        return DeviceResponse.fromEntity(saved);
    }

    @Transactional
    public DeviceResponse rotateDeviceKey(UUID deviceId, UUID authenticatedUserId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

        verifyFarmMembership(device.getFarm().getId(), authenticatedUserId);

        if (device.getRevokedAt() != null || "REVOKED".equalsIgnoreCase(device.getStatus())) {
            throw new AuthException("BAD_REQUEST", "Cannot rotate key for a revoked device", 400);
        }

        // Generate a new 32-character high-entropy API key
        String newRawKey = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String newHash = tokenHasher.hashToken(newRawKey);

        device.setApiKeyHash(newHash);
        device.setLastRotatedAt(Instant.now());

        Device saved = deviceRepository.save(device);
        DeviceResponse response = DeviceResponse.fromEntity(saved);
        response.setProvisioningApiKey(newRawKey);
        return response;
    }

    @Transactional
    public Device saveDevice(Device device) {
        return deviceRepository.save(device);
    }
}
