package com.smartlivestock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_reading_animal_id", columnList = "animal_id"),
    @Index(name = "idx_reading_device_id", columnList = "device_id")
})
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private SensorDevice device;

    private Double temperature;
    
    private Integer activityLevel;
    
    private LocalDateTime timestamp;
}
