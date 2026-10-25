package com.smartlivestock.backend.repository;

import com.smartlivestock.backend.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    List<SensorReading> findByAnimalId(Long animalId);
    Optional<SensorReading> findFirstByAnimalIdOrderByTimestampDesc(Long animalId);
    
    Optional<SensorReading> findTopByAnimalOrderByTimestampDesc(com.smartlivestock.backend.entity.Animal animal);
    List<SensorReading> findByAnimalAndTimestampBetweenOrderByTimestampAsc(com.smartlivestock.backend.entity.Animal animal, java.time.LocalDateTime start, java.time.LocalDateTime end);
    Optional<SensorReading> findByDeviceAndTimestamp(com.smartlivestock.backend.entity.SensorDevice device, java.time.LocalDateTime timestamp);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM SensorReading sr WHERE sr.timestamp < :cutoff")
    void deleteByTimestampBefore(@org.springframework.data.repository.query.Param("cutoff") java.time.LocalDateTime cutoff);
}
