package com.smartlivestock.backend.telemetry.repository;

import com.smartlivestock.backend.telemetry.entity.SensorTelemetry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SensorTelemetryRepository extends JpaRepository<SensorTelemetry, UUID> {
    List<SensorTelemetry> findByAnimalIdOrderByIngestedAtDesc(UUID animalId, Pageable pageable);
    Optional<SensorTelemetry> findTopByAnimalIdOrderByIngestedAtDesc(UUID animalId);
    Optional<SensorTelemetry> findTopByDeviceIdOrderByIngestedAtDesc(UUID deviceId);
    List<SensorTelemetry> findByAnimalIdOrderByMeasuredAtDesc(UUID animalId, Pageable pageable);
    Optional<SensorTelemetry> findTopByAnimalIdOrderByMeasuredAtDesc(UUID animalId);
    List<SensorTelemetry> findByAnimalIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(UUID animalId, Instant start, Instant end);
    boolean existsByDeviceIdAndMeasuredAt(UUID deviceId, Instant measuredAt);
}
