package com.smartlivestock.backend.animal.service;

import com.smartlivestock.backend.animal.dto.AnimalResponse;
import com.smartlivestock.backend.animal.dto.CreateAnimalRequest;
import com.smartlivestock.backend.animal.entity.Animal;
import com.smartlivestock.backend.animal.repository.AnimalRepository;
import com.smartlivestock.backend.common.exception.AuthException;
import com.smartlivestock.backend.common.exception.DuplicateResourceException;
import com.smartlivestock.backend.common.exception.ResourceNotFoundException;
import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final FarmRepository farmRepository;
    private final FarmMembershipRepository membershipRepository;

    public AnimalService(
            AnimalRepository animalRepository,
            FarmRepository farmRepository,
            FarmMembershipRepository membershipRepository
    ) {
        this.animalRepository = animalRepository;
        this.farmRepository = farmRepository;
        this.membershipRepository = membershipRepository;
    }

    private void verifyFarmMembership(UUID farmId, UUID userId) {
        boolean isMember = membershipRepository.existsByFarmIdAndUserIdAndStatus(
                farmId, userId, MembershipStatus.ACTIVE
        );
        if (!isMember) {
            throw new AuthException("FORBIDDEN", "Access to farm animals denied", 403);
        }
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> getAnimalsByFarm(UUID farmId, UUID authenticatedUserId) {
        verifyFarmMembership(farmId, authenticatedUserId);
        return animalRepository.findByFarmId(farmId).stream()
                .map(AnimalResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnimalResponse getAnimalById(UUID animalId, UUID authenticatedUserId) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with id: " + animalId));
        verifyFarmMembership(animal.getFarm().getId(), authenticatedUserId);
        return AnimalResponse.fromEntity(animal);
    }

    @Transactional
    public AnimalResponse createAnimal(CreateAnimalRequest request, UUID authenticatedUserId) {
        verifyFarmMembership(request.getFarmId(), authenticatedUserId);

        if (request.getTagNumber() != null && !request.getTagNumber().isBlank()) {
            if (animalRepository.existsByFarmIdAndTagNumber(request.getFarmId(), request.getTagNumber())) {
                throw new DuplicateResourceException("Animal with tag number " + request.getTagNumber() + " already exists in this farm");
            }
        }

        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + request.getFarmId()));

        Animal animal = new Animal();
        animal.setFarm(farm);
        animal.setName(request.getName());
        animal.setTagNumber(request.getTagNumber());
        animal.setSpecies(request.getSpecies() != null ? request.getSpecies() : "CATTLE");
        animal.setBreed(request.getBreed());
        animal.setDateOfBirth(request.getDateOfBirth());
        animal.setGender(request.getGender());
        animal.setStatus("HEALTHY");

        Animal saved = animalRepository.save(animal);
        return AnimalResponse.fromEntity(saved);
    }
}
