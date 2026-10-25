package com.smartlivestock.backend.dto;

import lombok.Data;

@Data
public class HistoryPointDto {
    private String time;
    private String label;
    private Double temperature;
    private Integer activity;
    private Double milkYield;
}
