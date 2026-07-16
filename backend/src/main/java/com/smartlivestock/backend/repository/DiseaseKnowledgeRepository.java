package com.smartlivestock.backend.repository;

import com.smartlivestock.backend.entity.DiseaseKnowledge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiseaseKnowledgeRepository extends JpaRepository<DiseaseKnowledge, Long> {
    Optional<DiseaseKnowledge> findByDiseaseNameIgnoreCase(String diseaseName);
}
