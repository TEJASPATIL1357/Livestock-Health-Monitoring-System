package com.smartlivestock.backend.ai.dto;

import com.smartlivestock.backend.ai.entity.AiAssessment;

import java.time.Instant;
import java.util.UUID;

public class AiAssessmentResponse {
    private UUID id;
    private UUID animalId;
    private String animalName;
    private UUID farmId;
    private String healthStatus;
    private String summaryEn;
    private String summaryHi;
    private String summaryMr;
    private Integer readingCount;
    private Double avgTemperature;
    private Instant windowStart;
    private Instant windowEnd;
    private Instant assessedAt;
    private String disclaimer = "Advisory notice: AI health insights are for guidance and do not replace licensed veterinary diagnosis.";

    public static AiAssessmentResponse fromEntity(AiAssessment entity) {
        AiAssessmentResponse dto = new AiAssessmentResponse();
        dto.setId(entity.getId());
        dto.setAnimalId(entity.getAnimal().getId());
        dto.setAnimalName(entity.getAnimal().getName());
        dto.setFarmId(entity.getFarm().getId());
        dto.setHealthStatus(entity.getHealthStatus());
        dto.setSummaryEn(entity.getSummaryEn());
        dto.setSummaryHi(entity.getSummaryHi());
        dto.setSummaryMr(entity.getSummaryMr());
        dto.setReadingCount(entity.getReadingCount());
        dto.setAvgTemperature(entity.getAvgTemperature());
        dto.setWindowStart(entity.getWindowStart());
        dto.setWindowEnd(entity.getWindowEnd());
        dto.setAssessedAt(entity.getAssessedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getAnimalId() { return animalId; }
    public void setAnimalId(UUID animalId) { this.animalId = animalId; }

    public String getAnimalName() { return animalName; }
    public void setAnimalName(String animalName) { this.animalName = animalName; }

    public UUID getFarmId() { return farmId; }
    public void setFarmId(UUID farmId) { this.farmId = farmId; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public String getSummaryEn() { return summaryEn; }
    public void setSummaryEn(String summaryEn) { this.summaryEn = summaryEn; }

    public String getSummaryHi() { return summaryHi; }
    public void setSummaryHi(String summaryHi) { this.summaryHi = summaryHi; }

    public String getSummaryMr() { return summaryMr; }
    public void setSummaryMr(String summaryMr) { this.summaryMr = summaryMr; }

    public Integer getReadingCount() { return readingCount; }
    public void setReadingCount(Integer readingCount) { this.readingCount = readingCount; }

    public Double getAvgTemperature() { return avgTemperature; }
    public void setAvgTemperature(Double avgTemperature) { this.avgTemperature = avgTemperature; }

    public Instant getWindowStart() { return windowStart; }
    public void setWindowStart(Instant windowStart) { this.windowStart = windowStart; }

    public Instant getWindowEnd() { return windowEnd; }
    public void setWindowEnd(Instant windowEnd) { this.windowEnd = windowEnd; }

    public Instant getAssessedAt() { return assessedAt; }
    public void setAssessedAt(Instant assessedAt) { this.assessedAt = assessedAt; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
