package com.smartlivestock.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SensorReadingDto {
    
    @NotBlank
    private String deviceId;
    
    @NotNull
    private Long animalId;
    
    @NotNull
    private Double temperature;
    
    @NotNull
    private Integer activity;
    
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}
