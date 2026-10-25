package com.smartlivestock.backend.ai;

import com.smartlivestock.backend.dto.PromptContext;
import com.smartlivestock.backend.entity.DiseaseKnowledge;
import com.smartlivestock.backend.service.DiseaseKnowledgeService;
import com.smartlivestock.backend.service.RecommendationEngine;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RuleBasedProvider implements AiProvider {

    private final DiseaseKnowledgeService diseaseKnowledgeService;
    private final RecommendationEngine recommendationEngine;

    public RuleBasedProvider(DiseaseKnowledgeService diseaseKnowledgeService, RecommendationEngine recommendationEngine) {
        this.diseaseKnowledgeService = diseaseKnowledgeService;
        this.recommendationEngine = recommendationEngine;
    }

    @Override
    public boolean isAvailable() {
        return true; // Fallback is always available
    }

    @Override
    public String generateResponse(PromptContext context) {
        // Construct a synthetic symptom string from context to feed into the disease matcher
        StringBuilder syntheticSymptoms = new StringBuilder(context.getUserMessage());
        
        if (context.getCurrentTemperature() != null && context.getCurrentTemperature() > 39.5) {
            syntheticSymptoms.append(" fever temperature hot");
        }
        if (context.getCurrentActivity() != null && context.getCurrentActivity() < 40) {
            syntheticSymptoms.append(" lethargy inactive slow lazy");
        }
        if (context.getMilkYield() != null && context.getMilkYield() < 10) {
            syntheticSymptoms.append(" low milk drop");
        }
        
        List<DiseaseKnowledge> matchedDiseases = diseaseKnowledgeService.matchDiseases(syntheticSymptoms.toString());
        
        return recommendationEngine.generateFallbackRecommendation(context, matchedDiseases);
    }
}
