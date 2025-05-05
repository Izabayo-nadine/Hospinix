package com.hospital.pharmacy.service;

import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DataInitializationService {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void initData() {
        // Check if any users exist
        if (userRepository.count() == 0) {
            createUsers();
        }
    }

    private void createUsers() {
        // Create Admin
        User admin = new User();
        admin.setUserId("ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setEmail("admin@hospital.com");
        admin.setPassword("admin123");
        admin.setPhoneNumber("1234567890");
        admin.setAddress("123 Admin St, Hospital City");
        admin.setGender("Male");
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        admin.setActive(true);
        userRepository.save(admin);

        // Create Doctor
        User doctor = new User();
        doctor.setUserId("DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        doctor.setFirstName("John");
        doctor.setLastName("Smith");
        doctor.setEmail("doctor@hospital.com");
        doctor.setPassword("doctor123");
        doctor.setRole("DOCTOR");
        doctor.setPhoneNumber("1234567891");
        doctor.setAddress("456 Doctor Ave, Hospital City");
        doctor.setGender("Male");
        doctor.setSpecialization("Cardiology");
        doctor.setLicenseNumber("MED-1234");
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        doctor.setActive(true);
        userRepository.save(doctor);

        // Create Pharmacist
        User pharmacist = new User();
        pharmacist.setUserId("PHM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pharmacist.setFirstName("Emily");
        pharmacist.setLastName("Johnson");
        pharmacist.setEmail("pharmacist@hospital.com");
        pharmacist.setPassword("pharmacist123");
        pharmacist.setRole("PHARMACIST");
        pharmacist.setPhoneNumber("1234567892");
        pharmacist.setAddress("789 Pharma Blvd, Hospital City");
        pharmacist.setGender("Female");
        pharmacist.setLicenseNumber("PHR-5678");
        pharmacist.setCreatedAt(LocalDateTime.now());
        pharmacist.setUpdatedAt(LocalDateTime.now());
        pharmacist.setActive(true);
        userRepository.save(pharmacist);

        // Create Receptionist
        User receptionist = new User();
        receptionist.setUserId("RCP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        receptionist.setFirstName("Sarah");
        receptionist.setLastName("Williams");
        receptionist.setEmail("receptionist@hospital.com");
        receptionist.setPassword("receptionist123");
        receptionist.setRole("RECEPTIONIST");
        receptionist.setPhoneNumber("1234567893");
        receptionist.setAddress("101 Front Desk Rd, Hospital City");
        receptionist.setGender("Female");
        receptionist.setCreatedAt(LocalDateTime.now());
        receptionist.setUpdatedAt(LocalDateTime.now());
        receptionist.setActive(true);
        userRepository.save(receptionist);
    }
}