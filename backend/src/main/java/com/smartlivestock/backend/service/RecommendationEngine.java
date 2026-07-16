package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.PromptContext;
import com.smartlivestock.backend.entity.DiseaseKnowledge;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationEngine {

    public String generateFallbackRecommendation(PromptContext context, List<DiseaseKnowledge> matchedDiseases) {
        StringBuilder response = new StringBuilder();
        
        response.append("### Health Summary\n");
        if (context.getAnimalName() != null) {
            response.append("Based on the recent telemetry for **").append(context.getAnimalName()).append("**, ");
            if (context.getCurrentTemperature() > 39.5) {
                response.append("there is a significant fever. ");
            } else {
                response.append("temperature is within normal ranges. ");
            }
            if (context.getCurrentActivity() < 40) {
                response.append("Activity levels are concerningly low. ");
            }
            response.append("\n\n");
        } else {
            response.append("Based on your symptoms: ").append(context.getUserMessage()).append("\n\n");
        }

        if (!matchedDiseases.isEmpty()) {
            response.append("### Possible Causes\n");
            for (DiseaseKnowledge dk : matchedDiseases) {
                response.append("- **").append(dk.getDiseaseName()).append("**: ").append(dk.getDescription()).append("\n");
            }
            response.append("\n");

            response.append("### Recommended Actions\n");
            for (DiseaseKnowledge dk : matchedDiseases) {
                response.append("- ").append(dk.getRecommendations()).append("\n");
            }
            response.append("\n");

            // Calculate highest urgency
            String maxUrgency = "LOW";
            for (DiseaseKnowledge dk : matchedDiseases) {
                if ("CRITICAL".equals(dk.getSeverity())) maxUrgency = "CRITICAL";
                else if ("HIGH".equals(dk.getSeverity()) && !"CRITICAL".equals(maxUrgency)) maxUrgency = "HIGH";
                else if ("MEDIUM".equals(dk.getSeverity()) && "LOW".equals(maxUrgency)) maxUrgency = "MEDIUM";
            }
            
            response.append("### Urgency Level: ").append(maxUrgency).append("\n\n");
            
            if ("HIGH".equals(maxUrgency) || "CRITICAL".equals(maxUrgency)) {
                response.append("> **🚨 EMERGENCY ACTION**: ");
                for (DiseaseKnowledge dk : matchedDiseases) {
                    if ("HIGH".equals(dk.getSeverity()) || "CRITICAL".equals(dk.getSeverity())) {
                        response.append(dk.getEmergencyAction()).append(" ");
                    }
                }
                response.append("\n\n");
            }
        } else {
            response.append("### Recommended Actions\n");
            response.append("Please provide more specific symptoms or monitor the animal closely. Provide fresh water and observe feeding behavior.\n\n");
        }

        response.append("---\n*Disclaimer: I am an AI assistant operating in offline rule-based mode. Please consult a qualified veterinarian for a confirmed diagnosis and treatment plan.*");
        
        return response.toString();
    }
}
