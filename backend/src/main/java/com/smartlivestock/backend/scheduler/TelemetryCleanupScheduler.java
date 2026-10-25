package com.smartlivestock.backend.scheduler;

import com.smartlivestock.backend.repository.SensorReadingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TelemetryCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(TelemetryCleanupScheduler.class);
    private final SensorReadingRepository readingRepository;

    public TelemetryCleanupScheduler(SensorReadingRepository readingRepository) {
        this.readingRepository = readingRepository;
    }

    // Run every hour to delete readings older than 48 hours
    @Scheduled(fixedRate = 3600000)
    public void cleanupOldTelemetry() {
        log.info("Running scheduled cleanup for telemetry older than 48 hours...");
        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
        try {
            readingRepository.deleteByTimestampBefore(cutoff);
            log.info("Successfully deleted old telemetry data.");
        } catch (Exception e) {
            log.error("Error occurred while deleting old telemetry: ", e);
        }
    }
}
