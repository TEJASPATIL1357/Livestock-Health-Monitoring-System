package com.smartlivestock.backend.telemetry.entity;

import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.farm.entity.Farm;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sensor_telemetry")
public class SensorTelemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false)
    private Double temperature;

    @Column(name = "measured_at", nullable = false)
    private Instant measuredAt;

    @Column(name = "ingested_at", nullable = false)
    private Instant ingestedAt;

    @Column(name = "movement_available", nullable = false)
    private Boolean movementAvailable = false;

    @Column(name = "accel_x")
    private Double accelX;

    @Column(name = "accel_y")
    private Double accelY;

    @Column(name = "accel_z")
    private Double accelZ;

    @Column(name = "gyro_x")
    private Double gyroX;

    @Column(name = "gyro_y")
    private Double gyroY;

    @Column(name = "gyro_z")
    private Double gyroZ;

    @PrePersist
    protected void onCreate() {
        if (this.ingestedAt == null) {
            this.ingestedAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Instant getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(Instant measuredAt) { this.measuredAt = measuredAt; }

    public Instant getIngestedAt() { return ingestedAt; }
    public void setIngestedAt(Instant ingestedAt) { this.ingestedAt = ingestedAt; }

    public Boolean getMovementAvailable() { return movementAvailable; }
    public void setMovementAvailable(Boolean movementAvailable) { this.movementAvailable = movementAvailable; }

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
