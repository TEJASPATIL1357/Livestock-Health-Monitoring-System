package com.smartlivestock.backend.ai.repository;

import com.smartlivestock.backend.ai.entity.AiAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiAssessmentRepository extends JpaRepository<AiAssessment, UUID> {
    Optional<AiAssessment> findTopByAnimalIdOrderByAssessedAtDesc(UUID animalId);
}
