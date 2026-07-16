package com.smartlivestock.backend.dto;

import lombok.Data;

@Data
public class ChatRequestDto {
    private Long farmerId;
    private Long animalId;
    private String message;
    private String language;
}
