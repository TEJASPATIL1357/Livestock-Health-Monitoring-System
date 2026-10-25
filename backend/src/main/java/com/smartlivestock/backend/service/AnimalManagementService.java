package com.smartlivestock.backend.service;

import com.smartlivestock.backend.dto.AnimalDto;
import java.util.List;

public interface AnimalManagementService {
    AnimalDto createAnimal(AnimalDto animalDto);
    List<AnimalDto> getAnimalsByFarmer(Long farmerId);
    AnimalDto getAnimalById(Long id);
}
