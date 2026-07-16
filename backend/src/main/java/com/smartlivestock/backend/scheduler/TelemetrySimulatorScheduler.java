package com.smartlivestock.backend.scheduler;

import com.smartlivestock.backend.websocket.TelemetryWebSocketHandler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@EnableScheduling
public class TelemetrySimulatorScheduler {

    private final TelemetryWebSocketHandler telemetryHandler;
    private final Random random = new Random();

    public TelemetrySimulatorScheduler(TelemetryWebSocketHandler telemetryHandler) {
        this.telemetryHandler = telemetryHandler;
    }

    /**
     * Pushes simulated sensor fluctuations to all active client sockets every 10 seconds.
     */
    @Scheduled(fixedRate = 10000)
    public void simulateSensorFeeds() {
        // Generating random changes for Lakshmi COW-001 & Ganga COW-002
        double temp1 = 38.2 + random.nextDouble() * 0.8; // Normal (38.2 to 39.0)
        double temp2 = 39.4 + random.nextDouble() * 1.6; // Higher/Fever range (39.4 to 41.0)
        
        int activity1 = 50 + random.nextInt(30);
        int activity2 = 10 + random.nextInt(25); // Sick, low activity

        // Broadcast telemetry for COW-001 (Lakshmi)
        String telemetry1 = String.format(
            "{\"type\":\"telemetry\",\"animalId\":\"COW-001\",\"animalName\":\"Lakshmi\",\"temperature\":%.1f,\"activity\":%d}",
            temp1, activity1
        );
        telemetryHandler.broadcast(telemetry1);

        // Broadcast telemetry for COW-002 (Ganga)
        String telemetry2 = String.format(
            "{\"type\":\"telemetry\",\"animalId\":\"COW-002\",\"animalName\":\"Ganga\",\"temperature\":%.1f,\"activity\":%d}",
            temp2, activity2
        );
        telemetryHandler.broadcast(telemetry2);

        // FEVER ALARM TRIGGER: If temp is critical, stream instant alert message
        if (temp2 >= 40.2) {
            String alertPayload = String.format(
                "{\"type\":\"alert\",\"id\":\"ALT-%d\",\"animalId\":\"COW-002\",\"animalName\":\"Ganga\",\"severity\":\"critical\",\"message\":\"Critical body temperature detected (%.1f°C)! Contact veterinarian.\",\"timestamp\":\"%s\",\"read\":false}",
                System.currentTimeMillis() % 10000, temp2, java.time.Instant.now().toString()
            );
            telemetryHandler.broadcast(alertPayload);
        }
    }
}
