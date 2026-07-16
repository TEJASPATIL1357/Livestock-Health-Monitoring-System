package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.service.HealthReportService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HealthReportServiceImpl implements HealthReportService {

    @Override
    public void generateReport(Long animalId, Long veterinarianId, String diagnosis, String recommendation) {
        // Mock Implementation
    }

    @Override
    public List<Object> getReportsByAnimal(Long animalId) {
        return new ArrayList<>();
    }
}
