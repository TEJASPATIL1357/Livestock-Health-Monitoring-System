package com.smartlivestock.backend.bootstrap;

import com.smartlivestock.backend.entity.Animal;
import com.smartlivestock.backend.entity.Farmer;
import com.smartlivestock.backend.entity.Admin;
import com.smartlivestock.backend.entity.Doctor;
import com.smartlivestock.backend.entity.User;
import com.smartlivestock.backend.entity.SensorDevice;
import com.smartlivestock.backend.entity.DiseaseKnowledge;
import com.smartlivestock.backend.repository.AnimalRepository;
import com.smartlivestock.backend.repository.FarmerRepository;
import com.smartlivestock.backend.repository.UserRepository;
import com.smartlivestock.backend.repository.SensorDeviceRepository;
import com.smartlivestock.backend.repository.DiseaseKnowledgeRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements ApplicationRunner {

    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final SensorDeviceRepository deviceRepository;
    private final DiseaseKnowledgeRepository diseaseKnowledgeRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            FarmerRepository farmerRepository,
            UserRepository userRepository,
            AnimalRepository animalRepository,
            SensorDeviceRepository deviceRepository,
            DiseaseKnowledgeRepository diseaseKnowledgeRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.farmerRepository = farmerRepository;
        this.userRepository = userRepository;
        this.animalRepository = animalRepository;
        this.deviceRepository = deviceRepository;
        this.diseaseKnowledgeRepository = diseaseKnowledgeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Auto-seed only if database tables are empty
        if (userRepository.count() == 0) {
            System.out.println(">>> Database is empty. Seeding default Smart Livestock health profiles...");

            // 1. Seed default Farmer
            Farmer farmer = new Farmer();
            farmer.setUsername("farmer_tejas");
            farmer.setPassword(passwordEncoder.encode("password123"));
            farmer.setEmail("tejas@smartlivestock.com");
            farmer.setRole(User.Role.FARMER);
            farmer.setStatus(User.Status.APPROVED);
            Farmer savedFarmer = farmerRepository.save(farmer);

            // Seed default Admin
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setEmail("admin@admin.com");
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(User.Status.APPROVED);
            userRepository.save(admin);

            // Seed default Doctor
            Doctor doctor = new Doctor();
            doctor.setUsername("vet_doc");
            doctor.setPassword(passwordEncoder.encode("password123"));
            doctor.setEmail("vet@smartlivestock.com");
            doctor.setRole(User.Role.VETERINARY_DOCTOR);
            doctor.setStatus(User.Status.APPROVED);
            userRepository.save(doctor);

            // 2. Seed Premium Cow: Lakshmi (COW-001)
            Animal lakshmi = new Animal();
            lakshmi.setName("Lakshmi");
            lakshmi.setBreed("Gir");
            lakshmi.setSpecies("Cow");
            lakshmi.setTagNumber("COW-001");
            lakshmi.setDateOfBirth(LocalDate.now().minusYears(5));
            lakshmi.setFarmer(savedFarmer);
            Animal savedLakshmi = animalRepository.save(lakshmi);

            // 3. Seed Premium Cow: Ganga (COW-002) - Sick, Fever
            Animal ganga = new Animal();
            ganga.setName("Ganga");
            ganga.setBreed("Sahiwal");
            ganga.setSpecies("Cow");
            ganga.setTagNumber("COW-002");
            ganga.setDateOfBirth(LocalDate.now().minusYears(4));
            ganga.setFarmer(savedFarmer);
            Animal savedGanga = animalRepository.save(ganga);

            // 4. Seed Premium Cow: Nandini (COW-003) - High Yield
            Animal nandini = new Animal();
            nandini.setName("Nandini");
            nandini.setBreed("Holstein Friesian");
            nandini.setSpecies("Cow");
            nandini.setTagNumber("COW-003");
            nandini.setDateOfBirth(LocalDate.now().minusYears(3));
            nandini.setFarmer(savedFarmer);
            animalRepository.save(nandini);

            // 5. Seed Premium Cow: Kamadhenu (COW-004)
            Animal kamadhenu = new Animal();
            kamadhenu.setName("Kamadhenu");
            kamadhenu.setBreed("Red Sindhi");
            kamadhenu.setSpecies("Cow");
            kamadhenu.setTagNumber("COW-004");
            kamadhenu.setDateOfBirth(LocalDate.now().minusYears(6));
            kamadhenu.setFarmer(savedFarmer);
            animalRepository.save(kamadhenu);

            // 6. Seed Premium Buffalo: Mahisha (BUFF-001)
            Animal mahisha = new Animal();
            mahisha.setName("Mahisha");
            mahisha.setBreed("Murrah Buffalo");
            mahisha.setSpecies("Buffalo");
            mahisha.setTagNumber("BUFF-001");
            mahisha.setDateOfBirth(LocalDate.now().minusYears(5));
            mahisha.setFarmer(savedFarmer);
            animalRepository.save(mahisha);

            // 7. Seed Premium Cow: Parvati (COW-007)
            Animal parvati = new Animal();
            parvati.setName("Parvati");
            parvati.setBreed("Jersey Cross");
            parvati.setSpecies("Cow");
            parvati.setTagNumber("COW-007");
            parvati.setDateOfBirth(LocalDate.now().minusYears(4));
            parvati.setFarmer(savedFarmer);
            animalRepository.save(parvati);

            // 8. Bind physical IoT collars
            SensorDevice collar1 = new SensorDevice();
            collar1.setDeviceId("ESP32-COLLAR-001");
            collar1.setDeviceName("Primary Collar");
            collar1.setApiKey("test-api-key-1");
            collar1.setStatus("ACTIVE");
            collar1.setLastSeen(LocalDateTime.now());
            collar1.setAssignedAnimal(savedLakshmi);
            deviceRepository.save(collar1);

            SensorDevice collar2 = new SensorDevice();
            collar2.setDeviceId("ESP32-COLLAR-002");
            collar2.setDeviceName("Secondary Collar");
            collar2.setApiKey("test-api-key-2");
            collar2.setStatus("ACTIVE");
            collar2.setLastSeen(LocalDateTime.now());
            collar2.setAssignedAnimal(savedGanga);
            deviceRepository.save(collar2);

            System.out.println(">>> Database seeded successfully! Active collars are online.");
        } else {
            System.out.println(">>> Database already seeded. Ready for live sensor streams.");
        }

        // 9. Seed Disease Knowledge Base (Runs independently of user seeding)
        if (diseaseKnowledgeRepository.count() == 0) {
            System.out.println(">>> Seeding Disease Knowledge Base...");
            diseaseKnowledgeRepository.save(new DiseaseKnowledge(
                    "Fever",
                    "Elevated body temperature indicating an underlying infection or heat stress.",
                    "High temperature (>39.5°C), lethargy, reduced feed intake.",
                    "MEDIUM",
                    "Keep the animal hydrated, place it in a cool and shaded place, monitor closely.",
                    "Contact a veterinarian immediately if temperature exceeds 40°C."
            ));
            diseaseKnowledgeRepository.save(new DiseaseKnowledge(
                    "Mastitis",
                    "Inflammation of the mammary gland and udder tissue.",
                    "Swollen, hot, or painful udder, abnormal milk (clots, watery), reduced milk yield, fever.",
                    "HIGH",
                    "Maintain proper milking hygiene, separate the affected animal, apply warm compresses.",
                    "Call a veterinarian for antibiotic treatment immediately to save the udder."
            ));
            diseaseKnowledgeRepository.save(new DiseaseKnowledge(
                    "Foot and Mouth Disease (FMD)",
                    "A severe, highly contagious viral disease of cattle and swine.",
                    "Blisters in the mouth and on feet, excessive salivation, lameness, high fever, sharp drop in milk yield.",
                    "CRITICAL",
                    "Isolate the animal IMMEDIATELY. Disinfect the entire premises. Do not allow movement of animals.",
                    "Notify veterinary authorities. Highly contagious. Requires immediate quarantine."
            ));
            diseaseKnowledgeRepository.save(new DiseaseKnowledge(
                    "Bloat",
                    "Accumulation of gas in the rumen.",
                    "Swollen left side of the abdomen, difficulty breathing, restlessness.",
                    "HIGH",
                    "Keep the animal moving, do not let it lie down. Remove access to lush pasture.",
                    "Call a vet immediately for trocharization or stomach tubing if breathing is severely restricted."
            ));
            diseaseKnowledgeRepository.save(new DiseaseKnowledge(
                    "Tick Infestation",
                    "External parasites that feed on blood and can transmit diseases.",
                    "Visible ticks on the body, scratching, anemia (pale gums), lethargy.",
                    "LOW",
                    "Apply approved acaricides (tick treatments). Keep the housing area clean and dry.",
                    "Consult a vet if the animal shows signs of severe tick-borne disease (like Babesiosis/Redwater)."
            ));
        }
    }
}
