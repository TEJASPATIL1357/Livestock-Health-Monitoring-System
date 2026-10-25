package com.smartlivestock.backend.ai.service;

import com.smartlivestock.backend.ai.dto.AiAssessmentResponse;
import com.smartlivestock.backend.ai.entity.AiAssessment;
import com.smartlivestock.backend.ai.repository.AiAssessmentRepository;
import com.smartlivestock.backend.alert.service.AlertService;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.telemetry.entity.SensorTelemetry;
import com.smartlivestock.backend.telemetry.repository.SensorTelemetryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AiHealthIntelligenceService {

    private final AiAssessmentRepository aiAssessmentRepository;
    private final AnimalRepository animalRepository;
    private final SensorTelemetryRepository telemetryRepository;
    private final FarmMembershipRepository membershipRepository;
    private final AlertService alertService;

    public AiHealthIntelligenceService(
            AiAssessmentRepository aiAssessmentRepository,
            AnimalRepository animalRepository,
            SensorTelemetryRepository telemetryRepository,
            FarmMembershipRepository membershipRepository,
            AlertService alertService
    ) {
        this.aiAssessmentRepository = aiAssessmentRepository;
        this.animalRepository = animalRepository;
        this.telemetryRepository = telemetryRepository;
        this.membershipRepository = membershipRepository;
        this.alertService = alertService;
    }

    private void verifyFarmMembership(UUID farmId, UUID userId) {
        boolean isMember = membershipRepository.existsByFarmIdAndUserIdAndStatus(
                farmId, userId, MembershipStatus.ACTIVE
        );
        if (!isMember) {
            throw new AuthException("FORBIDDEN", "Access to farm AI health assessment denied", 403);
        }
    }

    @Transactional(readOnly = true)
    public AiAssessmentResponse getLatestAssessment(UUID animalId, UUID authenticatedUserId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with id: " + animalId));

        verifyFarmMembership(animal.getFarm().getId(), authenticatedUserId);

        AiAssessment assessment = aiAssessmentRepository.findTopByAnimalIdOrderByAssessedAtDesc(animalId)
                .orElseGet(() -> evaluateAnimalHealth(animal, Duration.ofHours(24)));

        return AiAssessmentResponse.fromEntity(assessment);
    }

    @Transactional
    public AiAssessment evaluateAnimalHealth(Animal animal, Duration windowDuration) {
        Instant now = Instant.now();
        Instant windowStart = now.minus(windowDuration);

        List<SensorTelemetry> readings = telemetryRepository
                .findByAnimalIdAndMeasuredAtBetweenOrderByMeasuredAtAsc(animal.getId(), windowStart, now)
                .stream()
                .filter(t -> t.getTemperature() != null && Math.abs(t.getTemperature() - (-127.0)) > 0.1)
                .collect(Collectors.toList());

        AiAssessment assessment = new AiAssessment();
        assessment.setAnimal(animal);
        assessment.setFarm(animal.getFarm());
        assessment.setWindowStart(windowStart);
        assessment.setWindowEnd(now);
        assessment.setAssessedAt(now);
        assessment.setReadingCount(readings.size());

        if (readings.isEmpty()) {
            assessment.setHealthStatus("INSUFFICIENT_DATA");
            assessment.setAvgTemperature(null);
            assessment.setSummaryEn("Insufficient sensor telemetry available for " + animal.getName() + ". Further DS18B20 temperature measurements are required for analysis.");
            assessment.setSummaryHi(animal.getName() + " के लिए पर्याप्त सेंसर डेटा उपलब्ध नहीं है। विश्लेषण के लिए और तापमान रीडिंग की आवश्यकता है।");
            assessment.setSummaryMr(animal.getName() + " साठी पुरेसा सेन्सर डेटा उपलब्ध नाही. विश्लेषणासाठी आणखी तापमान रीडिंगची गरज आहे.");
            return aiAssessmentRepository.save(assessment);
        }

        double avgTemp = readings.stream().mapToDouble(SensorTelemetry::getTemperature).average().orElse(0.0);
        double maxTemp = readings.stream().mapToDouble(SensorTelemetry::getTemperature).max().orElse(0.0);
        double minTemp = readings.stream().mapToDouble(SensorTelemetry::getTemperature).min().orElse(0.0);
        double roundedAvg = Math.round(avgTemp * 10.0) / 10.0;
        double roundedMax = Math.round(maxTemp * 10.0) / 10.0;

        assessment.setAvgTemperature(roundedAvg);

        if (maxTemp >= 39.5) {
            assessment.setHealthStatus("CRITICAL");
            assessment.setSummaryEn("CRITICAL: Elevated temperature detected for " + animal.getName() + " (Peak: " + roundedMax + "°C, Avg: " + roundedAvg + "°C). Potential fever/infection. Veterinary evaluation recommended.");
            assessment.setSummaryHi("गंभीर: " + animal.getName() + " का तापमान अधिक है (अधिकतम: " + roundedMax + "°C, औसत: " + roundedAvg + "°C)। बुखार की संभावना है। पशु चिकित्सक से संपर्क करें।");
            assessment.setSummaryMr("गंभीर: " + animal.getName() + " चे तापमान वाढले आहे (कमाल: " + roundedMax + "°C, सरासरी: " + roundedAvg + "°C). तापाची शक्यता. डॉक्टरांचा सल्ला घ्या.");

            // Create alert
            alertService.createAlert(
                    animal.getFarm(),
                    animal,
                    null,
                    "HIGH_TEMPERATURE",
                    "CRITICAL",
                    "High Temperature Alert: " + animal.getName(),
                    "Peak temperature reached " + roundedMax + "°C. Immediate veterinary attention advised.",
                    "HIGH_TEMP_" + animal.getId()
            );
        } else if (maxTemp >= 38.9 || minTemp < 37.0) {
            assessment.setHealthStatus("ATTENTION_REQUIRED");
            assessment.setSummaryEn("ATTENTION: Temperature variation recorded for " + animal.getName() + " (Avg: " + roundedAvg + "°C). Monitor feed, water intake, and rest patterns.");
            assessment.setSummaryHi("ध्यान दें: " + animal.getName() + " के तापमान में उतार-चढ़ाव दर्ज किया गया (औसत: " + roundedAvg + "°C)। आहार और पानी पर ध्यान दें।");
            assessment.setSummaryMr("लक्ष द्या: " + animal.getName() + " च्या तापमानात बदल आढळला (सरासरी: " + roundedAvg + "°C). खाद्य आणि पाण्याचे निरीक्षण करा.");

            alertService.createAlert(
                    animal.getFarm(),
                    animal,
                    null,
                    "TEMPERATURE_VARIATION",
                    "WARNING",
                    "Health Warning: " + animal.getName(),
                    "Temperature fluctuation detected (Avg: " + roundedAvg + "°C). Observe closely.",
                    "TEMP_VAR_" + animal.getId()
            );
        } else {
            assessment.setHealthStatus("HEALTHY");
            assessment.setSummaryEn("HEALTHY: " + animal.getName() + " exhibits normal physiological body temperature (Avg: " + roundedAvg + "°C across " + readings.size() + " readings). Vital signs stable.");
            assessment.setSummaryHi("स्वस्थ: " + animal.getName() + " का शरीर का तापमान सामान्य है (औसत: " + roundedAvg + "°C, " + readings.size() + " रीडिंग)। स्थिति सामान्य है।");
            assessment.setSummaryMr("निरोगी: " + animal.getName() + " चे तापमान सामान्य आहे (सरासरी: " + roundedAvg + "°C, " + readings.size() + " रीडिंग). सर्व स्थिर आहे.");
        }

        return aiAssessmentRepository.save(assessment);
    }
}
