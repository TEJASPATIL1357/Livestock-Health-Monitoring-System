package com.smartlivestock.backend.service;

public interface MachineLearningService {
    
    /**
     * Calculates the animal's overall physiological health index (0 to 100).
     */
    int calculateHealthScore(Long animalId, Double temperature, Integer activity);

    /**
     * Categorizes active pathological disease risk levels (LOW, MEDIUM, HIGH).
     */
    String predictDiseaseRisk(Double temperature, Integer activity);

    /**
     * Forecasts the predicted milk yield (in Litres) for the upcoming day.
     */
    Double forecastMilkYield(Long animalId, Double baseYield, String diseaseRisk);

    /**
     * Evaluates the animal's physical trends (IMPROVING, STABLE, DECLINING).
     */
    String analyzeHealthTrend(Long animalId, Double temperature, Integer activity);
}
