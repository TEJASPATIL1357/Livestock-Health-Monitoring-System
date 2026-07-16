package com.smartlivestock.backend.controller;

import com.smartlivestock.backend.entity.Animal;
import com.smartlivestock.backend.entity.SensorDevice;
import com.smartlivestock.backend.repository.AnimalRepository;
import com.smartlivestock.backend.repository.SensorDeviceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/devices")
@Slf4j
public class DeviceController {

    private final SensorDeviceRepository deviceRepository;
    private final AnimalRepository animalRepository;

    public DeviceController(SensorDeviceRepository deviceRepository, AnimalRepository animalRepository) {
        this.deviceRepository = deviceRepository;
        this.animalRepository = animalRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerDevice(@RequestParam String deviceId, 
                                                              @RequestParam String deviceName,
                                                              @RequestParam(required = false) Long animalId) {
        
        SensorDevice device = deviceRepository.findByDeviceId(deviceId).orElse(new SensorDevice());
        device.setDeviceId(deviceId);
        device.setDeviceName(deviceName);
        
        // Generate new API Key
        String newApiKey = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        device.setApiKey(newApiKey);
        device.setStatus("ACTIVE");

        if (animalId != null) {
            Animal animal = animalRepository.findById(animalId)
                    .orElseThrow(() -> new com.smartlivestock.backend.exception.AnimalNotFoundException("Animal not found with ID: " + animalId));
            device.setAssignedAnimal(animal);
        }

        deviceRepository.save(device);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("AUDIT: Device registered: {} by user: {}", deviceId, currentUser);

        return ResponseEntity.ok(Map.of(
            "message", "Device registered successfully.",
            "deviceId", deviceId,
            "apiKey", newApiKey
        ));
    }

    @GetMapping
    public ResponseEntity<java.util.List<SensorDevice>> getAllDevices() {
        return ResponseEntity.ok(deviceRepository.findAll());
    }
}
