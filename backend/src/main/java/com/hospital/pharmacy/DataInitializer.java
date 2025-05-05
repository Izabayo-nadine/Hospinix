package com.hospital.pharmacy;

import com.hospital.pharmacy.model.Bed;
import com.hospital.pharmacy.model.Patient;
import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.BedRepository;
import com.hospital.pharmacy.repository.PatientRepository;
import com.hospital.pharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if there are no beds in the database
        if (bedRepository.count() == 0) {
            initializeBeds();
        }
    }

    private void initializeBeds() {
        System.out.println("Initializing hospital beds...");

        // Find a doctor to assign to some beds
        User doctor = userRepository.findByRole("DOCTOR").stream().findFirst().orElse(null);

        // Find a few patients to assign to beds
        List<Patient> patients = patientRepository.findAll();

        // Create General Ward beds
        createBed("BED-001", "General Ward", "101", "A", "Occupied",
                patients.size() > 0 ? patients.get(0) : null, "2023-11-25", "Pneumonia", doctor);
        createBed("BED-002", "General Ward", "101", "B", "Occupied",
                patients.size() > 1 ? patients.get(1) : null, "2023-11-26", "Gastroenteritis", doctor);
        createBed("BED-003", "General Ward", "102", "A", "Available", null, null, null, null);
        createBed("BED-004", "General Ward", "102", "B", "Maintenance", null, null, null, null);

        // Create ICU beds
        createBed("BED-005", "ICU", "201", "A", "Occupied",
                patients.size() > 2 ? patients.get(2) : null, "2023-11-24", "Myocardial Infarction", doctor);
        createBed("BED-006", "ICU", "201", "B", "Occupied",
                patients.size() > 3 ? patients.get(3) : null, "2023-11-27", "Severe Asthma Attack", doctor);
        createBed("BED-007", "ICU", "202", "A", "Available", null, null, null, null);

        // Create Pediatric Ward beds
        createBed("BED-008", "Pediatric Ward", "301", "A", "Occupied",
                patients.size() > 4 ? patients.get(4) : null, "2023-11-26", "Appendicitis", doctor);
        createBed("BED-009", "Pediatric Ward", "301", "B", "Available", null, null, null, null);

        // Create Maternity Ward beds
        createBed("BED-010", "Maternity Ward", "401", "A", "Occupied",
                patients.size() > 5 ? patients.get(5) : null, "2023-11-27", "Labor & Delivery", doctor);

        System.out.println("Hospital beds initialized successfully!");
    }

    private void createBed(String bedId, String wardName, String roomNumber, String bedNumber,
            String status, Patient patient, String admissionDate, String diagnosis, User doctor) {
        Bed bed = new Bed();
        bed.setBedId(bedId);
        bed.setWardName(wardName);
        bed.setRoomNumber(roomNumber);
        bed.setBedNumber(bedNumber);
        bed.setStatus(status);
        bed.setPatient(patient);
        bed.setAdmissionDate(admissionDate);
        bed.setDiagnosis(diagnosis);
        bed.setDoctor(doctor);
        bed.setCreatedAt(LocalDateTime.now());
        bed.setUpdatedAt(LocalDateTime.now());

        bedRepository.save(bed);
    }
}