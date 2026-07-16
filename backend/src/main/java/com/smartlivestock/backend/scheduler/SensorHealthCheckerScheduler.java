package com.smartlivestock.backend.scheduler;

import com.smartlivestock.backend.entity.SensorDevice;
import com.smartlivestock.backend.repository.SensorDeviceRepository;
import com.smartlivestock.backend.websocket.TelemetryWebSocketHandler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SensorHealthCheckerScheduler {

    private final SensorDeviceRepository deviceRepository;
    private final TelemetryWebSocketHandler webSocketHandler;

    public SensorHealthCheckerScheduler(
            SensorDeviceRepository deviceRepository,
            TelemetryWebSocketHandler webSocketHandler) {
        this.deviceRepository = deviceRepository;
        this.webSocketHandler = webSocketHandler;
    }

    /**
     * Checks status of active collar devices every 60 seconds.
     * Marks devices offline if no uploads have occurred for 15 minutes.
     */
    @Scheduled(fixedRate = 60000)
    public void monitorSensorHealth() {
        List<SensorDevice> activeDevices = deviceRepository.findByStatus("ACTIVE");
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);

        for (SensorDevice device : activeDevices) {
            if (device.getLastSeen() != null && device.getLastSeen().isBefore(threshold)) {
                // Device has timed out
                device.setStatus("OFFLINE");
                deviceRepository.save(device);

                // Broadcast critical system alert
                String animalTag = "Collar " + device.getDeviceId();
                String animalName = "Unassigned";
                String animalId = "N/A";

                if (device.getAssignedAnimal() != null) {
                    animalName = device.getAssignedAnimal().getName();
                    animalId = device.getAssignedAnimal().getTagNumber() != null ?
                            device.getAssignedAnimal().getTagNumber() : "COW-" + device.getAssignedAnimal().getId();
                }

                String alertPayload = String.format(
                    "{\"type\":\"alert\",\"id\":\"SYS-%d\",\"animalId\":\"%s\",\"animalName\":\"%s\",\"severity\":\"critical\",\"message\":\"IoT collar device [%s] has gone OFFLINE! No signals received for 15 minutes.\",\"timestamp\":\"%s\",\"read\":false}",
                    System.currentTimeMillis() % 10000,
                    animalId,
                    animalName,
                    device.getDeviceId(),
                    java.time.Instant.now().toString()
                );
                webSocketHandler.broadcast(alertPayload);
                System.out.println("Collar [" + device.getDeviceId() + "] detected OFFLINE. Warning pushed to active users.");
            }
        }
    }
}
