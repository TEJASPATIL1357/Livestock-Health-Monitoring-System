package com.smartlivestock.backend.service;

import com.smartlivestock.backend.entity.DiseaseKnowledge;
import com.smartlivestock.backend.repository.DiseaseKnowledgeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DiseaseKnowledgeService {

    private final DiseaseKnowledgeRepository repository;

    public DiseaseKnowledgeService(DiseaseKnowledgeRepository repository) {
        this.repository = repository;
    }

    public List<DiseaseKnowledge> matchDiseases(String symptoms) {
        String lowerSymptoms = symptoms.toLowerCase();
        List<DiseaseKnowledge> matched = new ArrayList<>();
        List<DiseaseKnowledge> all = repository.findAll();

        for (DiseaseKnowledge dk : all) {
            String dkSymptoms = dk.getSymptoms().toLowerCase();
            // Simple keyword matching for fallback rule-based provider
            if (lowerSymptoms.contains("fever") && dkSymptoms.contains("fever") ||
                lowerSymptoms.contains("temp") && dkSymptoms.contains("temperature") ||
                lowerSymptoms.contains("not eating") && dkSymptoms.contains("feed") ||
                lowerSymptoms.contains("milk") && dkSymptoms.contains("milk") ||
                lowerSymptoms.contains("swelling") && dkSymptoms.contains("swollen") ||
                lowerSymptoms.contains("mouth") && dkSymptoms.contains("mouth") ||
                lowerSymptoms.contains("tick") && dkSymptoms.contains("tick") ||
                lowerSymptoms.contains("bloat") && dkSymptoms.contains("rumen") ||
                lowerSymptoms.contains("lazy") && dkSymptoms.contains("lethargy") ||
                lowerSymptoms.contains("inactive") && dkSymptoms.contains("lethargy")) {
                matched.add(dk);
            }
        }
        
        // If exact matches based on name
        for (DiseaseKnowledge dk : all) {
            if (lowerSymptoms.contains(dk.getDiseaseName().toLowerCase()) && !matched.contains(dk)) {
                matched.add(dk);
            }
        }

        return matched;
    }
}
