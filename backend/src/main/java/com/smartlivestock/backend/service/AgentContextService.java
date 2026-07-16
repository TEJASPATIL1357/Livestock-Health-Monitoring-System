package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.PromptContext;
import com.smartlivestock.backend.dto.AnimalDto;
import com.smartlivestock.backend.service.AnimalManagementService;
import org.springframework.stereotype.Service;

@Service
public class AgentContextService {

    private final AnimalManagementService animalManagementService;

    public AgentContextService(AnimalManagementService animalManagementService) {
        this.animalManagementService = animalManagementService;
    }

    public PromptContext buildContext(String userMessage, String language, Long animalId) {
        PromptContext context = new PromptContext();
        context.setUserMessage(userMessage);
        context.setLanguage(language);

        if (animalId != null) {
            try {
                AnimalDto animal = animalManagementService.getAnimalById(animalId);
                context.setAnimalName(animal.getName());
                context.setAnimalSpecies(animal.getSpecies());
                context.setTagNumber(animal.getTagNumber());
                context.setCurrentTemperature(animal.getTemperature());
                context.setCurrentActivity(animal.getActivity() != null ? animal.getActivity().doubleValue() : null);
                context.setHealthStatus(animal.getHealthStatus());
                
                // Use predictedMilkYield
                context.setMilkYield(animal.getPredictedMilkYield() != null ? animal.getPredictedMilkYield() : 0.0);
            } catch (Exception e) {
                System.err.println("Failed to load animal context: " + e.getMessage());
            }
        }

        return context;
    }
}
