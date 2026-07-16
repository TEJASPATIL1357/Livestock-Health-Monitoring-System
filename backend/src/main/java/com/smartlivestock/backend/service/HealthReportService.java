package com.smartlivestock.backend.service;

import java.util.List;

public interface HealthReportService {
    void generateReport(Long animalId, Long veterinarianId, String diagnosis, String recommendation);
    List<Object> getReportsByAnimal(Long animalId);
}
