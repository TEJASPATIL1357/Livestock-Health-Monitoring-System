package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "sensor_devices", indexes = {
    @Index(name = "idx_device_device_id", columnList = "device_id")
})
public class SensorDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "device_id", unique = true)
    private String deviceId;
    
    @NotBlank
    private String deviceName;
    
    @NotBlank
    private String apiKey;
    
    private String status;
    
    private LocalDateTime lastSeen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal assignedAnimal;
}
