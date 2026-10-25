package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.service.MachineLearningService;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class MachineLearningServiceImpl implements MachineLearningService {

    private final Random random = new Random();

    @Override
    public int calculateHealthScore(Long animalId, Double temperature, Integer activity) {
        if (temperature == null || activity == null) {
            return 90; // Default baseline score
        }

        int score = 100;

        // Deductions based on Temperature anomalies
        if (temperature >= 39.5) {
            score -= 20; // Mild Fever
        }
        if (temperature >= 40.5) {
            score -= 15; // Critical Fever
        }
        if (temperature < 37.5) {
            score -= 15; // Hypothermia risk
        }

        // Deductions based on Activity spikes/dips
        if (activity < 35) {
            score -= 20; // Inactivity / Weakness
        }
        if (activity < 20) {
            score -= 15; // Extreme lethargy
        }
        if (activity > 95) {
            score -= 10; // Hyper-activity / Panic indicator
        }

        return Math.max(10, Math.min(100, score));
    }

    @Override
    public String predictDiseaseRisk(Double temperature, Integer activity) {
        /*
         * FUTURE ML MODEL HOOK (Python Flask/FastAPI integration):
         * -------------------------------------------------------------
         * RestTemplate restTemplate = new RestTemplate();
         * Map<String, Object> request = Map.of("temp", temperature, "activity", activity);
         * try {
         *     String pyRisk = restTemplate.postForObject("http://python-ml-server:5000/predict", request, String.class);
         *     return pyRisk; // HIGH, MEDIUM, LOW
         * } catch(Exception e) {
         *     // Fallback to local heuristics below if Python server is down
         * }
         */
        if (temperature == null || activity == null) {
            return "LOW";
        }

        if (temperature >= 39.8 && activity < 30) {
            return "HIGH"; // Fever + Lethargy = High risk of infection (e.g. Mastitis)
        } else if (temperature >= 39.3 || temperature < 37.2 || activity < 40) {
            return "MEDIUM"; // Mild symptoms
        }
        
        return "LOW";
    }

    @Override
    public Double forecastMilkYield(Long animalId, Double baseYield, String diseaseRisk) {
        if (baseYield == null) {
            baseYield = 15.0; // Standard average yield
        }

        double yieldMultiplier = 1.0;

        // Yield decreases significantly when the animal is sick
        if ("HIGH".equalsIgnoreCase(diseaseRisk)) {
            yieldMultiplier = 0.65; // 35% drop
        } else if ("MEDIUM".equalsIgnoreCase(diseaseRisk)) {
            yieldMultiplier = 0.85; // 15% drop
        } else {
            // Slight normal yield fluctuation (+- 5%)
            yieldMultiplier = 0.95 + (random.nextDouble() * 0.1);
        }

        double forecast = baseYield * yieldMultiplier;
        return +(Math.round(forecast * 10.0) / 10.0); // Round to 1 decimal place
    }

    @Override
    public String analyzeHealthTrend(Long animalId, Double temperature, Integer activity) {
        if (temperature == null || activity == null) {
            return "STABLE";
        }

        // Identify positive/negative trends
        if (temperature >= 39.8 || activity < 25) {
            return "DECLINING"; // Pathological stress detected
        } else if (temperature >= 37.8 && temperature <= 39.0 && activity >= 55) {
            return "IMPROVING"; // Normalizing values
        }

        return "STABLE";
    }
}
