package com.smartlivestock.backend.animal.repository;

import com.smartlivestock.backend.animal.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, UUID> {
    List<Animal> findByFarmId(UUID farmId);
    Optional<Animal> findByIdAndFarmId(UUID id, UUID farmId);
    boolean existsByFarmIdAndTagNumber(UUID farmId, String tagNumber);
}
