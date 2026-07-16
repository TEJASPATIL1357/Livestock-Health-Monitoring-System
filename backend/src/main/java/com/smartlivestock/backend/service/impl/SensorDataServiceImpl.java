package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.dto.SensorReadingDto;
import com.smartlivestock.backend.entity.Animal;
import com.smartlivestock.backend.entity.SensorDevice;
import com.smartlivestock.backend.entity.SensorReading;
import com.smartlivestock.backend.repository.AnimalRepository;
import com.smartlivestock.backend.repository.SensorDeviceRepository;
import com.smartlivestock.backend.repository.SensorReadingRepository;
import com.smartlivestock.backend.service.SensorDataService;
import com.smartlivestock.backend.websocket.TelemetryWebSocketHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SensorDataServiceImpl implements SensorDataService {

    private final SensorDeviceRepository deviceRepository;
    private final SensorReadingRepository readingRepository;
    private final AnimalRepository animalRepository;
    private final TelemetryWebSocketHandler webSocketHandler;

    public SensorDataServiceImpl(
            SensorDeviceRepository deviceRepository,
            SensorReadingRepository readingRepository,
            AnimalRepository animalRepository,
            TelemetryWebSocketHandler webSocketHandler) {
        this.deviceRepository = deviceRepository;
        this.readingRepository = readingRepository;
        this.animalRepository = animalRepository;
        this.webSocketHandler = webSocketHandler;
    }

    @Override
    @Transactional
    public SensorReadingDto uploadSensorData(SensorReadingDto readingDto) {
        // 1. Resolve the IoT Collar Device. It should already be registered via API Keys.
        SensorDevice device = deviceRepository.findByDeviceId(readingDto.getDeviceId())
                .orElseThrow(() -> new com.smartlivestock.backend.exception.DeviceNotFoundException("Device not registered. Please register device to get API key."));
                
        device.setStatus("ACTIVE");
        device.setLastSeen(LocalDateTime.now());
        deviceRepository.save(device);

        // 2. Bind Telemetry to Animal
        Animal animal = null;
        if (readingDto.getAnimalId() != null) {
            animal = animalRepository.findById(readingDto.getAnimalId()).orElse(null);
        } else if (device.getAssignedAnimal() != null) {
            animal = device.getAssignedAnimal();
        }

        if (animal != null) {
            LocalDateTime timestamp = readingDto.getTimestamp() != null ? readingDto.getTimestamp() : LocalDateTime.now();

            // Prevent duplicate records
            java.util.Optional<SensorReading> existingOpt = readingRepository.findByDeviceAndTimestamp(device, timestamp);
            if (existingOpt.isPresent()) {
                readingDto.setAnimalId(animal.getId());
                return readingDto;
            }

            // Save time-series sensor logs
            SensorReading reading = new SensorReading();
            reading.setAnimal(animal);
            reading.setDevice(device);
            reading.setTemperature(readingDto.getTemperature());
            reading.setActivityLevel(readingDto.getActivity()); // Map DTO activity -> Entity activityLevel
            reading.setTimestamp(timestamp);
            readingRepository.save(reading);

            // Sync dynamic parameters back into DTO
            readingDto.setAnimalId(animal.getId());

            // 3. Broadcast incoming telemetry over active WebSockets
            String tagId = animal.getTagNumber() != null ? animal.getTagNumber() : "COW-" + animal.getId();
            String telemetryPayload = String.format(
                "{\"type\":\"telemetry\",\"animalId\":\"%s\",\"animalName\":\"%s\",\"temperature\":%.1f,\"activity\":%d}",
                tagId,
                animal.getName(),
                readingDto.getTemperature(),
                readingDto.getActivity()
            );
            webSocketHandler.broadcast(telemetryPayload);
        }

        return readingDto;
    }
}
