package com.smartlivestock.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AnimalDto {
    private Long id;
    private String name;
    private String breed;
    private String species;
    private String tagNumber;
    private LocalDate dateOfBirth;
    private Long farmerId;

    // Machine Learning Predictive parameters
    private Integer healthScore;
    private String diseaseRisk;
    private Double predictedMilkYield;
    private String healthTrend;

    // Real-time UI fields
    private String healthStatus;
    private Double temperature;
    private Integer activity;
    
    // Historical Telemetry for Analytics Charts
    private java.util.List<HistoryPointDto> history;
}
