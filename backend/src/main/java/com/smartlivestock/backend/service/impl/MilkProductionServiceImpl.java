package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.dto.MilkProductionDto;
import com.smartlivestock.backend.service.MilkProductionService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MilkProductionServiceImpl implements MilkProductionService {

    @Override
    public MilkProductionDto logMilkProduction(MilkProductionDto dto) {
        return dto;
    }

    @Override
    public List<MilkProductionDto> getMilkStats(Long animalId) {
        return new ArrayList<>();
    }
}
