package com.smartlivestock.backend.telemetry.dto;

import com.smartlivestock.backend.telemetry.entity.SensorTelemetry;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

public class TelemetryResponse {
    private UUID id;
    private UUID deviceId;
    private String deviceIdentifier;
    private UUID animalId;
    private String animalName;
    private UUID farmId;
    private Double temperature;
    private Instant measuredAt;
    private Instant ingestedAt;
    private Boolean movementAvailable = false;
    private String movementStatus = "COMING_SOON";
    private Double accelX;
    private Double accelY;
    private Double accelZ;
    private Double gyroX;
    private Double gyroY;
    private Double gyroZ;
    private Boolean isStale = false;
    private Boolean isDisconnected = false;

    public static TelemetryResponse fromEntity(SensorTelemetry telemetry) {
        TelemetryResponse dto = new TelemetryResponse();
        dto.setId(telemetry.getId());
        dto.setDeviceId(telemetry.getDevice().getId());
        dto.setDeviceIdentifier(telemetry.getDevice().getDeviceIdentifier());
        dto.setAnimalId(telemetry.getAnimal().getId());
        dto.setAnimalName(telemetry.getAnimal().getName());
        dto.setFarmId(telemetry.getFarm().getId());
        dto.setTemperature(telemetry.getTemperature());
        dto.setMeasuredAt(telemetry.getMeasuredAt());
        dto.setIngestedAt(telemetry.getIngestedAt());

        boolean hasMovement = Boolean.TRUE.equals(telemetry.getMovementAvailable());
        dto.setMovementAvailable(hasMovement);
        if (hasMovement) {
            dto.setAccelX(telemetry.getAccelX());
            dto.setAccelY(telemetry.getAccelY());
            dto.setAccelZ(telemetry.getAccelZ());
            dto.setGyroX(telemetry.getGyroX());
            dto.setGyroY(telemetry.getGyroY());
            dto.setGyroZ(telemetry.getGyroZ());
            dto.setMovementStatus(classifyMovement(
                    telemetry.getAccelX(), telemetry.getAccelY(), telemetry.getAccelZ(),
                    telemetry.getGyroX(), telemetry.getGyroY(), telemetry.getGyroZ()
            ));
        } else {
            dto.setMovementStatus("COMING_SOON");
        }

        // Stale if last reading is older than 30 minutes
        if (telemetry.getMeasuredAt() != null) {
            long minutesAgo = Duration.between(telemetry.getMeasuredAt(), Instant.now()).toMinutes();
            dto.setIsStale(minutesAgo > 30);
        }

        // Sentinel -127°C check
        if (telemetry.getTemperature() != null && Math.abs(telemetry.getTemperature() - (-127.0)) < 0.1) {
            dto.setIsDisconnected(true);
        }

        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getDeviceId() { return deviceId; }
    public void setDeviceId(UUID deviceId) { this.deviceId = deviceId; }

    public String getDeviceIdentifier() { return deviceIdentifier; }
    public void setDeviceIdentifier(String deviceIdentifier) { this.deviceIdentifier = deviceIdentifier; }

    public UUID getAnimalId() { return animalId; }
    public void setAnimalId(UUID animalId) { this.animalId = animalId; }

    public String getAnimalName() { return animalName; }
    public void setAnimalName(String animalName) { this.animalName = animalName; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Instant getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(Instant measuredAt) { this.measuredAt = measuredAt; }

    public Instant getIngestedAt() { return ingestedAt; }
    public void setIngestedAt(Instant ingestedAt) { this.ingestedAt = ingestedAt; }

    public Boolean getMovementAvailable() { return movementAvailable; }
    public void setMovementAvailable(Boolean movementAvailable) { this.movementAvailable = movementAvailable; }

    public String getMovementStatus() { return movementStatus; }
    public void setMovementStatus(String movementStatus) { this.movementStatus = movementStatus; }

    public Boolean getIsStale() { return isStale; }
    public void setIsStale(Boolean isStale) { this.isStale = isStale; }

    public Boolean getIsDisconnected() { return isDisconnected; }
    public void setIsDisconnected(Boolean isDisconnected) { this.isDisconnected = isDisconnected; }

    public Double getAccelX() { return accelX; }
    public void setAccelX(Double accelX) { this.accelX = accelX; }

    public Double getAccelY() { return accelY; }
    public void setAccelY(Double accelY) { this.accelY = accelY; }

    public Double getAccelZ() { return accelZ; }
    public void setAccelZ(Double accelZ) { this.accelZ = accelZ; }

    public Double getGyroX() { return gyroX; }
    public void setGyroX(Double gyroX) { this.gyroX = gyroX; }

    public Double getGyroY() { return gyroY; }
    public void setGyroY(Double gyroY) { this.gyroY = gyroY; }

    public Double getGyroZ() { return gyroZ; }
    public void setGyroZ(Double gyroZ) { this.gyroZ = gyroZ; }

    public static String classifyMovement(Double ax, Double ay, Double az, Double gx, Double gy, Double gz) {
        if (ax == null && ay == null && az == null && gx == null && gy == null && gz == null) {
            return "UNKNOWN";
        }
        double x = ax != null ? ax : 0.0;
        double y = ay != null ? ay : 0.0;
        double z = az != null ? az : 0.0;
        double rx = gx != null ? gx : 0.0;
        double ry = gy != null ? gy : 0.0;
        double rz = gz != null ? gz : 0.0;

        double accelMag = Math.sqrt(x * x + y * y + z * z);
        double gyroMag = Math.sqrt(rx * rx + ry * ry + rz * rz);

        // Raw counts: ~16384 LSB/g at 1g static baseline; SI units: ~9.8 m/s^2
        double dynamicAccel = (accelMag > 500) ? Math.abs(accelMag - 16384.0) : Math.abs(accelMag - 9.8);

        if (gyroMag > 2500 || dynamicAccel > 4500) {
            return "ACTIVE";
        } else if (gyroMag > 350 || dynamicAccel > 1000) {
            return "NORMAL";
        } else {
            return "RESTING";
        }
    }
}
