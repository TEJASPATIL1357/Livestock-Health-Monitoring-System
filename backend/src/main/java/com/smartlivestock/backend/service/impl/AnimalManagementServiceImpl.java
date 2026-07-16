package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.dto.AnimalDto;
import com.smartlivestock.backend.entity.Animal;
import com.smartlivestock.backend.entity.Farmer;
import com.smartlivestock.backend.entity.SensorReading;
import com.smartlivestock.backend.repository.AnimalRepository;
import com.smartlivestock.backend.repository.FarmerRepository;
import com.smartlivestock.backend.repository.SensorReadingRepository;
import com.smartlivestock.backend.service.AnimalManagementService;
import com.smartlivestock.backend.service.MachineLearningService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AnimalManagementServiceImpl implements AnimalManagementService {

    private final AnimalRepository animalRepository;
    private final FarmerRepository farmerRepository;
    private final SensorReadingRepository readingRepository;
    private final MachineLearningService machineLearningService;

    public AnimalManagementServiceImpl(
            AnimalRepository animalRepository,
            FarmerRepository farmerRepository,
            SensorReadingRepository readingRepository,
            MachineLearningService machineLearningService) {
        this.animalRepository = animalRepository;
        this.farmerRepository = farmerRepository;
        this.readingRepository = readingRepository;
        this.machineLearningService = machineLearningService;
    }

    @Override
    @Transactional
    public AnimalDto createAnimal(AnimalDto animalDto) {
        Animal animal = new Animal();
        animal.setName(animalDto.getName());
        animal.setBreed(animalDto.getBreed());
        animal.setSpecies(animalDto.getSpecies());
        animal.setTagNumber(animalDto.getTagNumber());
        animal.setDateOfBirth(animalDto.getDateOfBirth());

        if (animalDto.getFarmerId() != null) {
            Farmer farmer = farmerRepository.findById(animalDto.getFarmerId()).orElse(null);
            animal.setFarmer(farmer);
        }

        Animal saved = animalRepository.save(animal);
        return convertToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnimalDto> getAnimalsByFarmer(Long farmerId) {
        List<Animal> animals = animalRepository.findByFarmerId(farmerId);
        List<AnimalDto> dtos = new ArrayList<>();

        for (Animal animal : animals) {
            dtos.add(convertToDto(animal));
        }

        // Fallback: If no database entries exist yet, return empty list
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalDto getAnimalById(Long id) {
        Animal animal = animalRepository.findById(id)
                .orElseThrow(() -> new com.smartlivestock.backend.exception.AnimalNotFoundException("Animal not found with ID: " + id));
        return convertToDto(animal);
    }

    /**
     * Converts a JPA Animal entity to a DTO and runs predictive ML logic
     * based on the animal's latest telemetry reading.
     */
    private AnimalDto convertToDto(Animal animal) {
        AnimalDto dto = new AnimalDto();
        dto.setId(animal.getId());
        dto.setName(animal.getName());
        dto.setBreed(animal.getBreed());
        dto.setSpecies(animal.getSpecies());
        dto.setTagNumber(animal.getTagNumber());
        dto.setDateOfBirth(animal.getDateOfBirth());
        
        if (animal.getFarmer() != null) {
            dto.setFarmerId(animal.getFarmer().getId());
        }

        // Fetch the latest dynamic telemetry sensor log
        Optional<SensorReading> latestReadingOpt = readingRepository
                .findTopByAnimalOrderByTimestampDesc(animal);

        if (latestReadingOpt.isPresent()) {
            SensorReading reading = latestReadingOpt.get();
            Double temp = reading.getTemperature();
            Integer activity = reading.getActivityLevel();

            // Run pluggable prediction algorithms
            int healthScore = machineLearningService.calculateHealthScore(animal.getId(), temp, activity);
            String risk = machineLearningService.predictDiseaseRisk(temp, activity);
            double baseYield = (animal.getBreed() != null && animal.getBreed().contains("Holstein")) ? 22.0 : 15.0;
            double forecastYield = machineLearningService.forecastMilkYield(animal.getId(), baseYield, risk);
            String trend = machineLearningService.analyzeHealthTrend(animal.getId(), temp, activity);

            // Populate DTO properties
            dto.setHealthScore(healthScore);
            dto.setDiseaseRisk(risk);
            dto.setPredictedMilkYield(forecastYield);
            dto.setHealthTrend(trend);

            // Populate Real-time UI fields
            dto.setTemperature(temp);
            dto.setActivity(activity);
            dto.setHealthStatus("HIGH".equalsIgnoreCase(risk) ? "critical" : "MEDIUM".equalsIgnoreCase(risk) ? "warning" : "healthy");
        } else {
            // Set normal, safe defaults if no IoT collar logs have been captured yet
            dto.setHealthScore(98);
            dto.setDiseaseRisk("LOW");
            dto.setPredictedMilkYield(16.5);
            dto.setHealthTrend("STABLE");

            dto.setTemperature(38.5);
            dto.setActivity(75);
            dto.setHealthStatus("healthy");
        }

        // Fetch actual historical data for Analytics Charts
        java.util.List<com.smartlivestock.backend.dto.HistoryPointDto> historyList = new java.util.ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime yesterday = now.minusHours(24);
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
        
        java.util.List<SensorReading> historicalReadings = readingRepository.findByAnimalAndTimestampBetweenOrderByTimestampAsc(animal, yesterday, now);
        
        // Downsample the data to a maximum of 96 points to prevent frontend chart array overflow
        int maxPoints = 96;
        int step = historicalReadings.size() > maxPoints ? historicalReadings.size() / maxPoints : 1;
        
        for (int i = 0; i < historicalReadings.size(); i += step) {
            SensorReading reading = historicalReadings.get(i);
            com.smartlivestock.backend.dto.HistoryPointDto pt = new com.smartlivestock.backend.dto.HistoryPointDto();
            pt.setTime(reading.getTimestamp().toString());
            pt.setLabel(reading.getTimestamp().format(formatter));
            pt.setTemperature(reading.getTemperature());
            pt.setActivity(reading.getActivityLevel());
            pt.setMilkYield(dto.getPredictedMilkYield() != null ? dto.getPredictedMilkYield() : 16.5);
            
            historyList.add(pt);
            
            if (historyList.size() >= maxPoints) break;
        }
        dto.setHistory(historyList);

        return dto;
    }
}
