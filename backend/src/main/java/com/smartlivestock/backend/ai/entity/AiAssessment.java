package com.smartlivestock.backend.ai.entity;

import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.farm.entity.Farm;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_assessments")
public class AiAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(name = "health_status", nullable = false)
    private String healthStatus; // HEALTHY, ATTENTION_REQUIRED, CRITICAL, INSUFFICIENT_DATA

    @Column(name = "summary_en", nullable = false, columnDefinition = "TEXT")
    private String summaryEn;

    @Column(name = "summary_hi", columnDefinition = "TEXT")
    private String summaryHi;

    @Column(name = "summary_mr", columnDefinition = "TEXT")
    private String summaryMr;

    @Column(name = "reading_count", nullable = false)
    private Integer readingCount = 0;

    @Column(name = "avg_temperature")
    private Double avgTemperature;

    @Column(name = "window_start")
    private Instant windowStart;

    @Column(name = "window_end")
    private Instant windowEnd;

    @Column(name = "assessed_at", nullable = false)
    private Instant assessedAt;

    @PrePersist
    protected void onCreate() {
        if (this.assessedAt == null) {
            this.assessedAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }

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
}
