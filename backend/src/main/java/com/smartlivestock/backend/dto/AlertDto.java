package com.smartlivestock.backend.dto;

import lombok.Data;

@Data
public class AlertDto {
    private Long id;
    private Long animalId;
    private String type;
    private String severity;
    private String message;
    private Boolean isRead;
}
