package com.smartlivestock.backend.repository;

import com.smartlivestock.backend.entity.SensorDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorDeviceRepository extends JpaRepository<SensorDevice, Long> {
    Optional<SensorDevice> findByDeviceId(String deviceId);
    Optional<SensorDevice> findByApiKey(String apiKey);
    Optional<SensorDevice> findByDeviceIdAndApiKey(String deviceId, String apiKey);
    List<SensorDevice> findByStatus(String status);
}
