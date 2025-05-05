package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.model.*;
import com.hospital.pharmacy.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/receptionist")
public class ReceptionistController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillingRepository billingRepository;

    // Receptionist Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<?> getReceptionistDashboard(HttpServletRequest request) {
        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        // Get today's date
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime tomorrow = today.plusDays(1);

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayAppointments", appointmentRepository.countAppointmentsBetween(today, tomorrow));
        stats.put("totalPatients", patientRepository.countTotalPatients());
        stats.put("availableDoctors", userRepository.findByFilters("DOCTOR", true, null).size());

        return ResponseEntity.ok(stats);
    }

    // Get all patients with filters
    @GetMapping("/patients")
    public ResponseEntity<?> getPatients(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<Patient> patients;
        try {
            // Try the regular JPA query first
            patients = patientRepository.findByFilters(status, null, search);
        } catch (Exception e) {
            // If it fails, fall back to the native query
            System.out.println("JPA query failed, falling back to native query: " + e.getMessage());
            patients = patientRepository.findByFiltersNative(status, null, search);
        }

        return ResponseEntity.ok(patients);
    }

    //appointmentbetweenstarandend
    @GetMapping("/between")
   public ResponseEntity<?> getAppointmentsToday(){
    LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
    LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
    List<Appointment> appointments = appointmentRepository.findByAppointmentDateTimeBetween(startOfDay, endOfDay);
    return ResponseEntity.ok(appointments);
   }

    // Register a new patient
    @PostMapping("/patients")
    public ResponseEntity<?> registerPatient(
            @RequestBody Patient patient,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        // Generate a unique patient ID
        patient.setPatientId("PAT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // Set default properties if not provided
        if (patient.getStatus() == null) {
            patient.setStatus("Active");
        }

        // Set registration date if not provided
        if (patient.getRegistrationDate() == null) {
            patient.setRegistrationDate(LocalDateTime.now());
        }

        Patient savedPatient = patientRepository.save(patient);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedPatient);
    }

    // Update a patient
    @PutMapping("/patients/{id}")
    public ResponseEntity<?> updatePatient(
            @PathVariable Long id,
            @RequestBody Patient updatedPatient,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            System.out.println("Updating patient with ID: " + id);
            System.out.println("Updated patient data: " + updatedPatient);
            System.out.println("Assigned doctor in request: " + updatedPatient.getAssignedDoctor());

            return patientRepository.findById(id)
                    .map(patient -> {
                        // Update fields but keep ID and patientId intact
                        patient.setFirstName(updatedPatient.getFirstName());
                        patient.setLastName(updatedPatient.getLastName());
                        patient.setDateOfBirth(updatedPatient.getDateOfBirth());
                        patient.setGender(updatedPatient.getGender());
                        patient.setEmail(updatedPatient.getEmail());
                        patient.setPhoneNumber(updatedPatient.getPhoneNumber());
                        patient.setAddress(updatedPatient.getAddress());
                        patient.setBloodGroup(updatedPatient.getBloodGroup());
                        patient.setHeight(updatedPatient.getHeight());
                        patient.setWeight(updatedPatient.getWeight());
                        patient.setAllergies(updatedPatient.getAllergies());
                        patient.setChronicDiseases(updatedPatient.getChronicDiseases());
                        patient.setEmergencyContactName(updatedPatient.getEmergencyContactName());
                        patient.setEmergencyContactPhone(updatedPatient.getEmergencyContactPhone());
                        patient.setEmergencyContactRelation(updatedPatient.getEmergencyContactRelation());
                        patient.setInsuranceProvider(updatedPatient.getInsuranceProvider());
                        patient.setInsurancePolicyNumber(updatedPatient.getInsurancePolicyNumber());
                        patient.setInsuranceExpiryDate(updatedPatient.getInsuranceExpiryDate());
                        patient.setOccupation(updatedPatient.getOccupation());
                        patient.setMaritalStatus(updatedPatient.getMaritalStatus());

                        // Handle doctor assignment specifically
                        if (updatedPatient.getAssignedDoctor() != null
                                && updatedPatient.getAssignedDoctor().getId() != null) {
                            System.out.println(
                                    "Looking up doctor with ID: " + updatedPatient.getAssignedDoctor().getId());
                            userRepository.findById(updatedPatient.getAssignedDoctor().getId())
                                    .ifPresent(doctor -> {
                                        System.out.println(
                                                "Found doctor: " + doctor.getFirstName() + " " + doctor.getLastName());
                                        patient.setAssignedDoctor(doctor);
                                    });
                        } else {
                            System.out.println("No doctor assigned, setting to null");
                            patient.setAssignedDoctor(null);
                        }

                        patient.setMedicalHistory(updatedPatient.getMedicalHistory());
                        patient.setStatus(updatedPatient.getStatus());
                        patient.setCurrentMedications(updatedPatient.getCurrentMedications());

                        Patient savedPatient = patientRepository.save(patient);
                        System.out.println("Successfully updated patient: " + savedPatient.getPatientId());
                        return ResponseEntity.ok(savedPatient);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating patient: " + e.getMessage()));
        }
    }

    // Get available doctors
    @GetMapping("/doctors")
    public ResponseEntity<?> getAvailableDoctors(HttpServletRequest request) {
        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<User> doctors = userRepository.findByFilters("DOCTOR", true, null);

        return ResponseEntity.ok(doctors);
    }

    // Schedule an appointment
    @PostMapping("/appointments")
    public ResponseEntity<?> scheduleAppointment(
            @RequestBody Map<String, Object> appointmentRequest,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            // Extract data from request
            Long doctorId = Long.valueOf(appointmentRequest.get("doctorId").toString());
            Long patientId = Long.valueOf(appointmentRequest.get("patientId").toString());
            String appointmentDateTime = (String) appointmentRequest.get("appointmentDateTime");
            String type = (String) appointmentRequest.get("type");
            Integer duration = Integer.valueOf(appointmentRequest.get("duration").toString());
            String notes = (String) appointmentRequest.get("notes");
            String status = (String) appointmentRequest.get("status");

            // Look up doctor and patient
            User doctor = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            // Create appointment
            Appointment appointment = new Appointment();
            appointment.setAppointmentId("APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            appointment.setDoctor(doctor);
            appointment.setPatient(patient);
            appointment.setAppointmentDateTime(LocalDateTime.parse(appointmentDateTime));
            appointment.setType(type != null ? type : "REGULAR");
            appointment.setDuration(duration != null ? duration : 30);
            appointment.setNotes(notes);
            appointment.setStatus(status != null ? status : "SCHEDULED");
            appointment.setCreatedBy(receptionist);

            Appointment savedAppointment = appointmentRepository.save(appointment);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedAppointment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to schedule appointment: " + e.getMessage()));
        }
    }

    // Get all appointments with filters
    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            // If no date parameters are provided, skip date parsing
            if ((startDate == null || startDate.isEmpty()) && (endDate == null || endDate.isEmpty())) {
                System.out.println("No date parameters provided, fetching with basic filters only");
                List<Appointment> appointments = appointmentRepository.findByBasicFilters(status, doctorId, patientId);
                return ResponseEntity.ok(appointments);
            }

            // Convert string dates to LocalDateTime if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;

            if (startDate != null && !startDate.isEmpty()) {
                try {
                    // Try parsing the date directly
                    startDateTime = LocalDateTime.parse(startDate);
                } catch (Exception e) {
                    try {
                        // If direct parsing fails, try to parse as ISO format with T
                        if (startDate.indexOf('T') < 0) {
                            startDate = startDate.replace(" ", "T");
                        }
                        startDateTime = LocalDateTime.parse(startDate);
                    } catch (Exception e2) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message",
                                        "Invalid start date format. Use ISO format (yyyy-MM-ddTHH:mm:ss)"));
                    }
                }
            }

            if (endDate != null && !endDate.isEmpty()) {
                try {
                    // Try parsing the date directly
                    endDateTime = LocalDateTime.parse(endDate);
                } catch (Exception e) {
                    try {
                        // If direct parsing fails, try to parse as ISO format with T
                        if (endDate.indexOf('T') < 0) {
                            endDate = endDate.replace(" ", "T");
                        }
                        endDateTime = LocalDateTime.parse(endDate);
                    } catch (Exception e2) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message",
                                        "Invalid end date format. Use ISO format (yyyy-MM-ddTHH:mm:ss)"));
                    }
                }
            }

            // Store final references to the date parameters
            final LocalDateTime finalStartDateTime = startDateTime;
            final LocalDateTime finalEndDateTime = endDateTime;

            List<Appointment> appointments = appointmentRepository.findAll();

            List<Appointment> filteredAppointments = appointments.stream()
                    .filter(appointment -> {
                        boolean matchesStatus = status == null || status.isEmpty()
                                || appointment.getStatus().equals(status);
                        boolean matchesDoctor = doctorId == null || appointment.getDoctor().getId().equals(doctorId);
                        boolean matchesPatient = patientId == null
                                || appointment.getPatient().getId().equals(patientId);
                        boolean dateRangeMatches = (finalStartDateTime == null
                                || appointment.getAppointmentDateTime().isAfter(finalStartDateTime)) &&
                                (finalEndDateTime == null
                                        || appointment.getAppointmentDateTime().isBefore(finalEndDateTime));
                        return matchesStatus && matchesDoctor && matchesPatient && dateRangeMatches;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(filteredAppointments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving appointments: " + e.getMessage()));
        }
    }

    // Update an appointment (reschedule, cancel)
    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment updatedAppointment,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return appointmentRepository.findById(id)
                .map(appointment -> {
                    // Update only allowed fields
                    appointment.setAppointmentDateTime(updatedAppointment.getAppointmentDateTime());
                    appointment.setStatus(updatedAppointment.getStatus());
                    appointment.setType(updatedAppointment.getType());
                    appointment.setDuration(updatedAppointment.getDuration());
                    appointment.setNotes(updatedAppointment.getNotes());

                    // If we're changing the doctor or patient, update those too
                    if (updatedAppointment.getDoctor() != null) {
                        appointment.setDoctor(updatedAppointment.getDoctor());
                    }

                    if (updatedAppointment.getPatient() != null) {
                        appointment.setPatient(updatedAppointment.getPatient());
                    }

                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get patient by ID
    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientById(
            @PathVariable Long id,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return patientRepository.findById(id)
                .map(patient -> ResponseEntity.ok(patient))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get patient by patient ID (string)
    @GetMapping("/patients/patientId/{patientId}")
    public ResponseEntity<?> getPatientByPatientId(
            @PathVariable String patientId,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return patientRepository.findByPatientId(patientId)
                .map(patient -> ResponseEntity.ok(patient))
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a patient by patientId (string ID)
    @PutMapping("/patients/patientId/{patientId}")
    public ResponseEntity<?> updatePatientByPatientId(
            @PathVariable String patientId,
            @RequestBody Patient updatedPatient,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            System.out.println("Updating patient with patientId: " + patientId);
            System.out.println("Updated patient data: " + updatedPatient);
            System.out.println("Assigned doctor in request: " + updatedPatient.getAssignedDoctor());

            return patientRepository.findByPatientId(patientId)
                    .map(patient -> {
                        // Update fields but keep ID and patientId intact
                        patient.setFirstName(updatedPatient.getFirstName());
                        patient.setLastName(updatedPatient.getLastName());
                        patient.setDateOfBirth(updatedPatient.getDateOfBirth());
                        patient.setGender(updatedPatient.getGender());
                        patient.setEmail(updatedPatient.getEmail());
                        patient.setPhoneNumber(updatedPatient.getPhoneNumber());
                        patient.setAddress(updatedPatient.getAddress());
                        patient.setBloodGroup(updatedPatient.getBloodGroup());
                        patient.setHeight(updatedPatient.getHeight());
                        patient.setWeight(updatedPatient.getWeight());
                        patient.setAllergies(updatedPatient.getAllergies());
                        patient.setChronicDiseases(updatedPatient.getChronicDiseases());
                        patient.setEmergencyContactName(updatedPatient.getEmergencyContactName());
                        patient.setEmergencyContactPhone(updatedPatient.getEmergencyContactPhone());
                        patient.setEmergencyContactRelation(updatedPatient.getEmergencyContactRelation());
                        patient.setInsuranceProvider(updatedPatient.getInsuranceProvider());
                        patient.setInsurancePolicyNumber(updatedPatient.getInsurancePolicyNumber());
                        patient.setInsuranceExpiryDate(updatedPatient.getInsuranceExpiryDate());
                        patient.setOccupation(updatedPatient.getOccupation());
                        patient.setMaritalStatus(updatedPatient.getMaritalStatus());

                        // Handle doctor assignment specifically
                        if (updatedPatient.getAssignedDoctor() != null
                                && updatedPatient.getAssignedDoctor().getId() != null) {
                            System.out.println(
                                    "Looking up doctor with ID: " + updatedPatient.getAssignedDoctor().getId());
                            userRepository.findById(updatedPatient.getAssignedDoctor().getId())
                                    .ifPresent(doctor -> {
                                        System.out.println(
                                                "Found doctor: " + doctor.getFirstName() + " " + doctor.getLastName());
                                        patient.setAssignedDoctor(doctor);
                                    });
                        } else {
                            System.out.println("No doctor assigned, setting to null");
                            patient.setAssignedDoctor(null);
                        }

                        patient.setMedicalHistory(updatedPatient.getMedicalHistory());
                        patient.setStatus(updatedPatient.getStatus());
                        patient.setCurrentMedications(updatedPatient.getCurrentMedications());

                        Patient savedPatient = patientRepository.save(patient);
                        System.out.println("Successfully updated patient: " + savedPatient.getPatientId());
                        return ResponseEntity.ok(savedPatient);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating patient: " + e.getMessage()));
        }
    }

    // Get appointments by doctor ID and date - using path variables to avoid JDBC
    // parameter issues
    @GetMapping("/doctors/{doctorId}/appointments/{date}")
    public ResponseEntity<?> getDoctorAppointmentsByDate(
            @PathVariable Long doctorId,
            @PathVariable String date,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            // Parse the date to create start and end of day
            LocalDate localDate = LocalDate.parse(date); // format: yyyy-MM-dd
            LocalDateTime startDateTime = localDate.atStartOfDay();
            LocalDateTime endDateTime = localDate.atTime(23, 59, 59);

            System.out.println("Searching for appointments between " + startDateTime + " and " + endDateTime);

            // Get appointments for this doctor on this date
            List<Appointment> appointments = appointmentRepository.findByDoctorAndDateRange(
                    doctorId, startDateTime, endDateTime);

            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid date format. Use ISO format (yyyy-MM-dd)"));
        }
    }

    // Update only the appointment status
    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Status is required"));
            }

            // Find the appointment
            return appointmentRepository.findById(id)
                    .map(appointment -> {
                        // Update only the status
                        appointment.setStatus(newStatus);

                        Appointment updatedAppointment = appointmentRepository.save(appointment);
                        return ResponseEntity.ok(updatedAppointment);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating appointment status: " + e.getMessage()));
        }
    }

    // Get appointment by ID
    @GetMapping("/appointments/{id}")
    public ResponseEntity<?> getAppointmentById(
            @PathVariable Long id,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            return appointmentRepository.findById(id)
                    .map(appointment -> ResponseEntity.ok(appointment))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving appointment: " + e.getMessage()));
        }
    }

    // Create a new billing
    @PostMapping("/billings")
    public ResponseEntity<?> createBilling(
            @RequestBody Map<String, Object> billingRequest,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            // Extract data from request
            Long patientId = Long.valueOf(billingRequest.get("patientId").toString());
            String appointmentId = billingRequest.get("appointmentId") != null
                    ? billingRequest.get("appointmentId").toString()
                    : null;
            String description = (String) billingRequest.get("description");
            String paymentMethod = (String) billingRequest.get("paymentMethod");
            String status = (String) billingRequest.get("status");
            BigDecimal totalAmount = new BigDecimal(billingRequest.get("totalAmount").toString());

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) billingRequest.get("items");

            // Look up patient
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            // Create billing
            Billing billing = new Billing();
            billing.setBillNumber("BILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            billing.setPatient(patient);
            billing.setBillDate(LocalDate.now());
            billing.setDueDate(LocalDate.now().plusDays(30)); // Set due date to 30 days from now
            billing.setTotalAmount(totalAmount);
            billing.setStatus(status != null ? status : "PENDING");
            billing.setPaymentMethod(paymentMethod);
            billing.setNotes(description);
            billing.setCreatedBy(receptionist);

            // Add billing items
            List<BillingItem> billingItems = new ArrayList<>();
            for (Map<String, Object> itemData : itemsData) {
                String itemDescription = (String) itemData.get("description");
                BigDecimal amount = new BigDecimal(itemData.get("amount").toString());

                BillingItem item = new BillingItem();
                item.setItemType("CONSULTATION"); // Default type
                item.setDescription(itemDescription);
                item.setQuantity(1);
                item.setUnitPrice(amount);
                item.setTotalPrice(amount);
                billingItems.add(item);
            }

            billing.setBillingItems(billingItems);

            // If this is a payment for an appointment, try to link it
            if (appointmentId != null && !appointmentId.isEmpty()) {
                try {
                    Long aptId = Long.valueOf(appointmentId);
                    appointmentRepository.findById(aptId).ifPresent(appointment -> {
                        // Update appointment status to indicate payment was processed
                        if (appointment.getStatus().equals("COMPLETED")) {
                            appointment.setStatus("BILLED");
                            appointmentRepository.save(appointment);
                        }
                    });
                } catch (NumberFormatException e) {
                    // Invalid appointment ID format, just log and continue
                    System.out.println("Invalid appointment ID format: " + appointmentId);
                }
            }

            // Save the billing entity
            Billing savedBilling = billingRepository.save(billing);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedBilling);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create billing: " + e.getMessage()));
        }
    }

    // Get all billings with filters
    @GetMapping("/billings")
    public ResponseEntity<?> getBillings(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            // Parse dates if provided
            LocalDate startLocalDate = null;
            LocalDate endLocalDate = null;

            if (startDate != null && !startDate.isEmpty()) {
                startLocalDate = LocalDate.parse(startDate);
            }

            if (endDate != null && !endDate.isEmpty()) {
                endLocalDate = LocalDate.parse(endDate);
            }

            // Query billings with filters
            List<Billing> billings = billingRepository.findByFilters(patientId, status, startLocalDate, endLocalDate);

            return ResponseEntity.ok(billings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving billings: " + e.getMessage()));
        }
    }

    // Get billing by ID
    @GetMapping("/billings/{id}")
    public ResponseEntity<?> getBillingById(
            @PathVariable Long id,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            return billingRepository.findById(id)
                    .map(billing -> ResponseEntity.ok(billing))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving billing: " + e.getMessage()));
        }
    }

    // Get billing by bill number - must come before the {id} endpoint to avoid
    // confusion
    @GetMapping("/billings/by-number/{billNumber}")
    public ResponseEntity<?> getBillingByBillNumber(
            @PathVariable String billNumber,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            Billing billing = billingRepository.findByBillNumber(billNumber);
            if (billing == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(billing);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving billing: " + e.getMessage()));
        }
    }

    // Update billing payment status
    @PutMapping("/billings/{id}/payment")
    public ResponseEntity<?> processBillingPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentRequest,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            return billingRepository.findById(id)
                    .map(billing -> {
                        // Extract payment information
                        String paymentMethod = (String) paymentRequest.get("paymentMethod");
                        BigDecimal paymentAmount = new BigDecimal(paymentRequest.get("amount").toString());
                        String notes = (String) paymentRequest.get("notes");

                        // Create a new payment record
                        Payment payment = new Payment();
                        payment.setPaymentDate(LocalDateTime.now());
                        payment.setAmount(paymentAmount);
                        payment.setPaymentMethod(paymentMethod);
                        payment.setNotes(notes);
                        payment.setReceivedBy(receptionist);

                        // Add payment to billing
                        billing.getPayments().add(payment);

                        // Update paid amount
                        billing.setPaidAmount(billing.getPaidAmount().add(paymentAmount));

                        // Update status based on paid amount
                        if (billing.getPaidAmount().compareTo(billing.getTotalAmount()) >= 0) {
                            billing.setStatus("PAID");
                        } else if (billing.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
                            billing.setStatus("PARTIALLY_PAID");
                        }

                        Billing updatedBilling = billingRepository.save(billing);
                        return ResponseEntity.ok(updatedBilling);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing payment: " + e.getMessage()));
        }
    }

    // Process payment for billing by bill number
    @PutMapping("/billings/by-number/{billNumber}/payment")
    public ResponseEntity<?> processBillingPaymentByBillNumber(
            @PathVariable String billNumber,
            @RequestBody Map<String, Object> paymentRequest,
            HttpServletRequest request) {

        User receptionist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (receptionist == null || !role.equals("RECEPTIONIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        try {
            Billing billing = billingRepository.findByBillNumber(billNumber);
            if (billing == null) {
                return ResponseEntity.notFound().build();
            }

            // Extract payment information
            String paymentMethod = (String) paymentRequest.get("paymentMethod");
            BigDecimal paymentAmount = new BigDecimal(paymentRequest.get("amount").toString());
            String notes = (String) paymentRequest.get("notes");

            // Create a new payment record
            Payment payment = new Payment();
            payment.setPaymentDate(LocalDateTime.now());
            payment.setAmount(paymentAmount);
            payment.setPaymentMethod(paymentMethod);
            payment.setNotes(notes);
            payment.setReceivedBy(receptionist);

            // Add payment to billing
            billing.getPayments().add(payment);

            // Update paid amount
            billing.setPaidAmount(billing.getPaidAmount().add(paymentAmount));

            // Update status based on paid amount
            if (billing.getPaidAmount().compareTo(billing.getTotalAmount()) >= 0) {
                billing.setStatus("PAID");
            } else if (billing.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
                billing.setStatus("PARTIALLY_PAID");
            }

            Billing updatedBilling = billingRepository.save(billing);
            return ResponseEntity.ok(updatedBilling);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing payment: " + e.getMessage()));
        }
    }
}