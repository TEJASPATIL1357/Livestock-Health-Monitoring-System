package com.smartlivestock.backend.alert.dto;

import com.smartlivestock.backend.alert.entity.Alert;

import java.time.Instant;
import java.util.UUID;

public class AlertResponse {
    private UUID id;
    private UUID farmId;
    private UUID animalId;
    private String animalName;
    private UUID deviceId;
    private String alertType;
    private String severity;
    private String title;
    private String message;
    private Boolean isRead;
    private Instant createdAt;

    public static AlertResponse fromEntity(Alert alert) {
        AlertResponse dto = new AlertResponse();
        dto.setId(alert.getId());
        dto.setFarmId(alert.getFarm().getId());
        if (alert.getAnimal() != null) {
            dto.setAnimalId(alert.getAnimal().getId());
            dto.setAnimalName(alert.getAnimal().getName());
        }
        if (alert.getDevice() != null) {
            dto.setDeviceId(alert.getDevice().getId());
        }
        dto.setAlertType(alert.getAlertType());
        dto.setSeverity(alert.getSeverity());
        dto.setTitle(alert.getTitle());
        dto.setMessage(alert.getMessage());
        dto.setIsRead(alert.getIsRead());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public UUID getAnimalId() { return animalId; }
    public void setAnimalId(UUID animalId) { this.animalId = animalId; }

    public String getAnimalName() { return animalName; }
    public void setAnimalName(String animalName) { this.animalName = animalName; }

    public UUID getDeviceId() { return deviceId; }
    public void setDeviceId(UUID deviceId) { this.deviceId = deviceId; }

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
