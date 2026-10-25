package com.smartlivestock.backend.farm.repository;

import com.smartlivestock.backend.farm.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FarmRepository extends JpaRepository<Farm, UUID> {
}
