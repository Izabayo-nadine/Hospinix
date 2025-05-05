package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.model.Patient;
import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data")
public class DataController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    /**
     * Provides all basic statistics needed for the dashboard
     */
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Users
        stats.put("totalDoctors", userRepository.countByRole("DOCTOR"));
        stats.put("totalPharmacists", userRepository.countByRole("PHARMACIST"));
        stats.put("totalReceptionists", userRepository.countByRole("RECEPTIONIST"));
        stats.put("totalAdmins", userRepository.countByRole("ADMIN"));

        // Patients
        stats.put("totalPatients", patientRepository.countTotalPatients());
        stats.put("activePatients", patientRepository.findByStatus("Active").size());
        stats.put("dischargedPatients", patientRepository.findByStatus("Discharged").size());

        // Appointments
        stats.put("totalAppointments", appointmentRepository.countTotalAppointments());
        stats.put("scheduledAppointments", appointmentRepository.countByStatus("SCHEDULED"));
        stats.put("completedAppointments", appointmentRepository.countByStatus("COMPLETED"));
        stats.put("cancelledAppointments", appointmentRepository.countByStatus("CANCELLED"));

        // Medicines & Companies
        stats.put("totalMedicines", medicineRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("lowStockMedicines", medicineRepository.findByStockStatus("Low").size() +
                medicineRepository.findByStockStatus("Critical").size());

        // Prescriptions
        stats.put("totalPrescriptions", prescriptionRepository.count());
        stats.put("activePrescriptions", prescriptionRepository.findByStatus("ACTIVE").size());
        stats.put("completedPrescriptions", prescriptionRepository.findByStatus("COMPLETED").size());

        // Add facility information
        stats.put("totalDepartments", 12); // Static data for now, could be from database
        stats.put("hospitalBeds", 120); // Static data for now, could be from database
        stats.put("monthlySurgeries", 38); // Static data for now, could be from database
        stats.put("patientSatisfaction", "4.7/5"); // Static data for now, could be from database

        return ResponseEntity.ok(stats);
    }

    /**
     * Returns facility information for the hospital
     */
    @GetMapping("/facility-info")
    public ResponseEntity<?> getFacilityInfo() {
        Map<String, Object> facilityInfo = new HashMap<>();

        // This would ideally come from a database, but using static values for now
        facilityInfo.put("totalDepartments", 12);
        facilityInfo.put("hospitalBeds", 120);
        facilityInfo.put("monthlySurgeries", 38);
        facilityInfo.put("patientSatisfaction", "4.7/5");
        facilityInfo.put("departmentList", List.of(
                Map.of("name", "Cardiology", "beds", 20, "staff", 15),
                Map.of("name", "Neurology", "beds", 18, "staff", 12),
                Map.of("name", "Orthopedics", "beds", 22, "staff", 16),
                Map.of("name", "Pediatrics", "beds", 25, "staff", 20),
                Map.of("name", "Oncology", "beds", 15, "staff", 18),
                Map.of("name", "Emergency", "beds", 10, "staff", 25),
                Map.of("name", "ICU", "beds", 10, "staff", 15)));

        return ResponseEntity.ok(facilityInfo);
    }

    /**
     * Returns all users for admin dashboard
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * Returns all patients
     */
    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    /**
     * Returns all doctors for appointment scheduling
     */
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(userRepository.findByRole("DOCTOR"));
    }

    /**
     * Returns all available account types for registration
     */
    @GetMapping("/account-types")
    public ResponseEntity<?> getAccountTypes() {
        List<String> accountTypes = List.of("ADMIN", "DOCTOR", "PHARMACIST", "RECEPTIONIST");
        return ResponseEntity.ok(accountTypes);
    }

    /**
     * Returns all appointments
     */
    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }
}