package com.smartlivestock.backend.alert.repository;

import com.smartlivestock.backend.alert.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByFarmIdOrderByCreatedAtDesc(UUID farmId);
    long countByFarmIdAndIsReadFalse(UUID farmId);
    boolean existsByDedupKeyAndCreatedAtAfter(String dedupKey, Instant threshold);
    boolean existsByDeviceIdAndIsReadFalseAndAlertType(UUID deviceId, String alertType);
    List<Alert> findByDeviceIdAndIsReadFalseAndAlertType(UUID deviceId, String alertType);
}
