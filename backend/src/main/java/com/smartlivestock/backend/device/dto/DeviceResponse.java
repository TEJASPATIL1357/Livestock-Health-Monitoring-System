package com.smartlivestock.backend.device.dto;

import com.smartlivestock.backend.device.entity.Device;

import java.time.Instant;
import java.util.UUID;

public class DeviceResponse {
    private UUID id;
    private String deviceIdentifier;
    private UUID farmId;
    private UUID animalId;
    private String animalName;
    private String status;
    private Instant lastSeenAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static DeviceResponse fromEntity(Device device) {
        DeviceResponse dto = new DeviceResponse();
        dto.setId(device.getId());
        dto.setDeviceIdentifier(device.getDeviceIdentifier());
        dto.setFarmId(device.getFarm().getId());
        if (device.getAnimal() != null) {
            dto.setAnimalId(device.getAnimal().getId());
            dto.setAnimalName(device.getAnimal().getName());
        }
        dto.setStatus(device.getStatus());
        dto.setLastSeenAt(device.getLastSeenAt());
        dto.setRevokedAt(device.getRevokedAt());
        dto.setLastRotatedAt(device.getLastRotatedAt());
        dto.setCreatedAt(device.getCreatedAt());
        dto.setUpdatedAt(device.getUpdatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDeviceIdentifier() { return deviceIdentifier; }
    public void setDeviceIdentifier(String deviceIdentifier) { this.deviceIdentifier = deviceIdentifier; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public UUID getAnimalId() { return animalId; }
    public void setAnimalId(UUID animalId) { this.animalId = animalId; }

    public String getAnimalName() { return animalName; }
    public void setAnimalName(String animalName) { this.animalName = animalName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(Instant lastSeenAt) { this.lastSeenAt = lastSeenAt; }

    private Instant revokedAt;
    private Instant lastRotatedAt;
    private String provisioningApiKey; // Populated only during registration or key rotation

    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }

    public Instant getLastRotatedAt() { return lastRotatedAt; }
    public void setLastRotatedAt(Instant lastRotatedAt) { this.lastRotatedAt = lastRotatedAt; }

    public String getProvisioningApiKey() { return provisioningApiKey; }
    public void setProvisioningApiKey(String provisioningApiKey) { this.provisioningApiKey = provisioningApiKey; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
