package com.smartlivestock.backend.repository;

import com.smartlivestock.backend.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {
    List<Animal> findByFarmerId(Long farmerId);
}
