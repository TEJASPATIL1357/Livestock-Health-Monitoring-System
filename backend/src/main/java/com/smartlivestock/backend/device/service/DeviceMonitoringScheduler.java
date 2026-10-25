package com.smartlivestock.backend.device.service;

import com.smartlivestock.backend.alert.service.AlertService;
import com.smartlivestock.backend.device.entity.Device;
import com.smartlivestock.backend.device.repository.DeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@ConditionalOnProperty(name = "scheduling.device-monitoring.enabled", havingValue = "true", matchIfMissing = true)
public class DeviceMonitoringScheduler {

    private static final Logger log = LoggerFactory.getLogger(DeviceMonitoringScheduler.class);

    private final DeviceRepository deviceRepository;
    private final AlertService alertService;
    private final com.smartlivestock.backend.alert.repository.AlertRepository alertRepository;
    private final com.smartlivestock.backend.telemetry.repository.SensorTelemetryRepository telemetryRepository;
    private Clock clock;

    @Value("${scheduling.offline-threshold-seconds:30}")
    private long offlineThresholdSeconds = 30;

    @Value("${scheduling.grace-period-hours:2}")
    private long gracePeriodHours = 2;

    public DeviceMonitoringScheduler(
            DeviceRepository deviceRepository,
            AlertService alertService,
            com.smartlivestock.backend.alert.repository.AlertRepository alertRepository,
            com.smartlivestock.backend.telemetry.repository.SensorTelemetryRepository telemetryRepository
    ) {
        this.deviceRepository = deviceRepository;
        this.alertService = alertService;
        this.alertRepository = alertRepository;
        this.telemetryRepository = telemetryRepository;
        this.clock = Clock.systemUTC();
    }

    public void setClock(Clock clock) {
        this.clock = clock;
    }

    public void setOfflineThresholdSeconds(long offlineThresholdSeconds) {
        this.offlineThresholdSeconds = offlineThresholdSeconds;
    }

    public void setGracePeriodHours(long gracePeriodHours) {
        this.gracePeriodHours = gracePeriodHours;
    }

    @Scheduled(fixedDelayString = "${scheduling.device-monitoring.fixed-delay-ms:5000}")
    @Transactional
    public void monitorDeviceStatus() {
        Instant now = clock.instant();

        List<Device> devices = deviceRepository.findAll();

        for (Device device : devices) {
            if (device.getRevokedAt() != null || "REVOKED".equalsIgnoreCase(device.getStatus())) {
                continue; // Skip revoked devices
            }

            Instant lastSeen = device.getLastSeenAt();
            com.smartlivestock.backend.telemetry.entity.SensorTelemetry latestTelem = telemetryRepository.findTopByDeviceIdOrderByIngestedAtDesc(device.getId()).orElse(null);
            if (latestTelem != null && (lastSeen == null || latestTelem.getIngestedAt().isAfter(lastSeen))) {
                lastSeen = latestTelem.getIngestedAt();
            }

            if (lastSeen == null) {
                // Check initial grace period for newly registered devices
                if (device.getCreatedAt().plus(Duration.ofHours(gracePeriodHours)).isBefore(now)) {
                    if (!"UNCONNECTED".equals(device.getStatus())) {
                        device.setStatus("UNCONNECTED");
                        deviceRepository.save(device);

                        boolean existsActive = alertRepository.existsByDeviceIdAndIsReadFalseAndAlertType(device.getId(), "DEVICE_UNCONNECTED");
                        if (!existsActive) {
                            alertService.createAlert(
                                    device.getFarm(),
                                    device.getAnimal(),
                                    device,
                                    "DEVICE_UNCONNECTED",
                                    "INFO",
                                    "Sensor Unconnected: " + device.getDeviceIdentifier(),
                                    "Registered device " + device.getDeviceIdentifier() + " has not connected within the initial " + gracePeriodHours + "-hour grace period.",
                                    "DEVICE_UNCONNECTED_" + device.getId()
                            );
                        }
                    }
                }
            } else {
                // Check offline threshold for previously connected devices
                Instant cutoff = now.minus(Duration.ofSeconds(offlineThresholdSeconds));
                if (lastSeen.isBefore(cutoff)) {
                    if (!"OFFLINE".equals(device.getStatus())) {
                        log.info("Device {} marked OFFLINE (lastSeen: {}, cutoff: {})", device.getDeviceIdentifier(), lastSeen, cutoff);
                        device.setStatus("OFFLINE");
                        deviceRepository.save(device);
                    }

                    boolean existsActive = alertRepository.existsByDeviceIdAndIsReadFalseAndAlertType(device.getId(), "DEVICE_OFFLINE");
                    if (!existsActive) {
                        log.info("Creating DEVICE_OFFLINE alert for device {}", device.getDeviceIdentifier());
                        alertService.createAlert(
                                device.getFarm(),
                                device.getAnimal(),
                                device,
                                "DEVICE_OFFLINE",
                                "WARNING",
                                "Sensor disconnected: " + device.getDeviceIdentifier(),
                                "Sensor " + device.getDeviceIdentifier() + " has not reported telemetry in the last " + offlineThresholdSeconds + " seconds. Live health data may be unavailable.",
                                "DEVICE_OFFLINE_" + device.getId() + "_" + now.toEpochMilli()
                        );
                    }
                }
            }
        }
    }
}
