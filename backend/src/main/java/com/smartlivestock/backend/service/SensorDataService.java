package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.SensorReadingDto;

public interface SensorDataService {
    SensorReadingDto uploadSensorData(SensorReadingDto readingDto);
}
