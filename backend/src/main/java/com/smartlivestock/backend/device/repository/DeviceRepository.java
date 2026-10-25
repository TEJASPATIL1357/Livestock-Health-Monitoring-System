package com.smartlivestock.backend.device.repository;

import com.smartlivestock.backend.device.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findByDeviceIdentifier(String deviceIdentifier);
    List<Device> findByFarmId(UUID farmId);
    Optional<Device> findByAnimalId(UUID animalId);
    boolean existsByDeviceIdentifier(String deviceIdentifier);
}
