package com.smartlivestock.backend.telemetry.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class SensorUploadRequest {

    private String deviceId; // Or deviceIdentifier
    private String deviceIdentifier;

    @NotNull(message = "temperature is required")
    private Double temperature;

    private Instant measuredAt;

    private Double accelX;
    private Double accelY;
    private Double accelZ;
    private Double gyroX;
    private Double gyroY;
    private Double gyroZ;

    public String getEffectiveDeviceId() {
        if (deviceId != null && !deviceId.isBlank()) return deviceId;
        return deviceIdentifier;
    }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getDeviceIdentifier() { return deviceIdentifier; }
    public void setDeviceIdentifier(String deviceIdentifier) { this.deviceIdentifier = deviceIdentifier; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Instant getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(Instant measuredAt) { this.measuredAt = measuredAt; }

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
}
