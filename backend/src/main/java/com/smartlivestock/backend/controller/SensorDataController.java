package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.dto.SensorReadingDto;
import com.smartlivestock.backend.entity.Animal;
import com.smartlivestock.backend.entity.SensorDevice;
import com.smartlivestock.backend.repository.AnimalRepository;
import com.smartlivestock.backend.repository.SensorDeviceRepository;
import com.smartlivestock.backend.service.SensorDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/sensors")
public class SensorDataController {

    private final SensorDataService sensorDataService;
    private final SensorDeviceRepository deviceRepository;
    private final AnimalRepository animalRepository;

    public SensorDataController(
            SensorDataService sensorDataService,
            SensorDeviceRepository deviceRepository,
            AnimalRepository animalRepository) {
        this.sensorDataService = sensorDataService;
        this.deviceRepository = deviceRepository;
        this.animalRepository = animalRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<SensorReadingDto> uploadData(@RequestBody SensorReadingDto readingDto) {
        return ResponseEntity.ok(sensorDataService.uploadSensorData(readingDto));
    }

}
