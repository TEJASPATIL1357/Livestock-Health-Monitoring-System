package com.smartlivestock.backend.device.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class RegisterDeviceRequest {

    @NotBlank(message = "deviceIdentifier is required")
    private String deviceIdentifier;

    @NotBlank(message = "apiKey is required")
    private String apiKey;

    @NotNull(message = "farmId is required")
    private UUID farmId;

    private UUID animalId;

    public String getDeviceIdentifier() { return deviceIdentifier; }
    public void setDeviceIdentifier(String deviceIdentifier) { this.deviceIdentifier = deviceIdentifier; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public UUID getAnimalId() { return animalId; }
    public void setAnimalId(UUID animalId) { this.animalId = animalId; }
}
