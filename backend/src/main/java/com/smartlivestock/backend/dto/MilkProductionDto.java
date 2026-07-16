package com.smartlivestock.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MilkProductionDto {
    private Long animalId;
    private LocalDate date;
    private String session; // MORNING or EVENING
    private Double quantityInLiters;
    private Double fatPercentage;
    private Double snfPercentage;
}
