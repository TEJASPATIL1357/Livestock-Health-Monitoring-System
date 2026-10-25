package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.MilkProductionDto;
import java.util.List;

public interface MilkProductionService {
    MilkProductionDto logMilkProduction(MilkProductionDto dto);
    List<MilkProductionDto> getMilkStats(Long animalId);
}
