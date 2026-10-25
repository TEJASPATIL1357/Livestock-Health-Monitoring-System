package com.smartlivestock.backend.device;

import com.smartlivestock.backend.alert.repository.AlertRepository;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.auth.util.TokenHasher;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.device.repository.DeviceRepository;
import com.smartlivestock.backend.device.service.DeviceMonitoringScheduler;
import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.entity.LivestockType;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.telemetry.dto.SensorUploadRequest;
import com.smartlivestock.backend.telemetry.service.TelemetryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DeviceMonitoringSchedulerTest {

    @Autowired
    private DeviceMonitoringScheduler scheduler;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private TelemetryService telemetryService;

    @Autowired
    private TokenHasher tokenHasher;

    private Farm testFarm;
    private Animal testAnimal;
    private final String rawApiKey = "test-key-555";

    @BeforeEach
    void setUp() {
        testFarm = new Farm();
        testFarm.setName("Scheduler Test Farm");
        testFarm.setLivestockType(LivestockType.DAIRY);
        testFarm.setStatus(FarmStatus.ACTIVE);
        testFarm = farmRepository.save(testFarm);

        testAnimal = new Animal();
        testAnimal.setFarm(testFarm);
        testAnimal.setName("Gauri");
        testAnimal.setSpecies("CATTLE");
        testAnimal.setStatus("HEALTHY");
        testAnimal = animalRepository.save(testAnimal);
    }

    @Test
    @DisplayName("Recently active device should NOT generate an offline alert")
    void testActiveDeviceNoAlert() {
        Instant now = Instant.now();
        Device device = new Device();
        device.setDeviceIdentifier("ESP32-ACTIVE-01");
        device.setApiKeyHash(tokenHasher.hashToken(rawApiKey));
        device.setFarm(testFarm);
        device.setAnimal(testAnimal);
        device.setStatus("ACTIVE");
        device.setLastSeenAt(now.minus(Duration.ofSeconds(10))); // Seen 10 seconds ago (< 30s threshold)
        deviceRepository.save(device);

        scheduler.setClock(Clock.fixed(now, ZoneId.of("UTC")));
        scheduler.monitorDeviceStatus();

        Device updated = deviceRepository.findByDeviceIdentifier("ESP32-ACTIVE-01").orElseThrow();
        assertEquals("ACTIVE", updated.getStatus());
        assertEquals(0, alertRepository.findByFarmIdOrderByCreatedAtDesc(testFarm.getId()).size());
    }

    @Test
    @DisplayName("Device past offline threshold should generate single deduplicated offline alert")
    void testDeviceOfflineAlertAndDeduplication() {
        Instant now = Instant.now();
        Device device = new Device();
        device.setDeviceIdentifier("ESP32-OFFLINE-01");
        device.setApiKeyHash(tokenHasher.hashToken(rawApiKey));
        device.setFarm(testFarm);
        device.setAnimal(testAnimal);
        device.setStatus("ACTIVE");
        device.setLastSeenAt(now.minus(Duration.ofSeconds(60))); // 60 seconds ago (> 30s threshold)
        device = deviceRepository.save(device);

        scheduler.setClock(Clock.fixed(now, ZoneId.of("UTC")));
        scheduler.monitorDeviceStatus();

        Device updated = deviceRepository.findByDeviceIdentifier("ESP32-OFFLINE-01").orElseThrow();
        assertEquals("OFFLINE", updated.getStatus());
        assertEquals(1, alertRepository.findByFarmIdOrderByCreatedAtDesc(testFarm.getId()).size());

        // Repeated run should not duplicate alert
        scheduler.monitorDeviceStatus();
        assertEquals(1, alertRepository.findByFarmIdOrderByCreatedAtDesc(testFarm.getId()).size());

        // Resume telemetry -> should recover to ACTIVE
        SensorUploadRequest req = new SensorUploadRequest();
        req.setDeviceId("ESP32-OFFLINE-01");
        req.setTemperature(38.4);
        req.setMeasuredAt(now);

        telemetryService.ingestSensorData(req, rawApiKey);

        Device recovered = deviceRepository.findByDeviceIdentifier("ESP32-OFFLINE-01").orElseThrow();
        assertEquals("ACTIVE", recovered.getStatus());
    }

    @Test
    @DisplayName("Newly registered device within grace period should NOT be marked offline")
    void testNewlyRegisteredDeviceGracePeriod() {
        Instant now = Instant.now();
        Device device = new Device();
        device.setDeviceIdentifier("ESP32-NEW-01");
        device.setApiKeyHash(tokenHasher.hashToken(rawApiKey));
        device.setFarm(testFarm);
        device.setAnimal(testAnimal);
        device.setStatus("ACTIVE");
        device.setLastSeenAt(null); // Never connected
        device.setCreatedAt(now.minus(Duration.ofMinutes(30))); // Created 30 min ago (< 2h grace)
        deviceRepository.save(device);

        scheduler.setClock(Clock.fixed(now, ZoneId.of("UTC")));
        scheduler.monitorDeviceStatus();

        Device updated = deviceRepository.findByDeviceIdentifier("ESP32-NEW-01").orElseThrow();
        assertEquals("ACTIVE", updated.getStatus());
        assertEquals(0, alertRepository.findByFarmIdOrderByCreatedAtDesc(testFarm.getId()).size());
    }
}
