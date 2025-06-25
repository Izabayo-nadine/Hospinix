package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.model.*;
import com.hospital.pharmacy.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private RoomRepository roomRepository;

    private static final Logger logger = Logger.getLogger(DoctorController.class.getName());

    // Doctor Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDoctorDashboard(Authentication authentication) {
        User doctor = (User) authentication.getPrincipal();

        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", appointmentRepository.countDistinctPatientsByDoctor(doctor.getId()));
        stats.put("todayAppointments",
                appointmentRepository.countTodaysAppointmentsByDoctor(doctor.getId(), startOfDay, endOfDay));
        stats.put("totalPrescriptions", prescriptionRepository.countByDoctor(doctor.getId()));

        return ResponseEntity.ok(stats);
    }

    // Get doctor's patients
    @GetMapping("/patientss")
    public ResponseEntity<?> getDoctorPatients1(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        try {
            System.out.println("Doctor ID: " + doctor.getId());
            System.out.println("Status filter: " + status);
            System.out.println("Search term: " + search);

            List<Patient> patients = patientRepository.findByFiltersNative(
                    status, doctor.getId(), search);

            System.out.println("Found " + patients.size() + " patients for doctor " + doctor.getId());

            if (patients.isEmpty()) {
                List<Patient> assignedPatients = patientRepository.findByAssignedDoctor(doctor);
                System.out.println("Found " + assignedPatients.size() + " patients via direct assigned doctor lookup");

                if (!assignedPatients.isEmpty()) {
                    return ResponseEntity.ok(assignedPatients);
                }
            }

            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving patients: " + e.getMessage()));
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getDoctorPatients(
            @RequestParam(required = false) String search,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        try {
            List<Patient> patients = appointmentRepository.findDistinctPatientsByDoctorIdAndSearch(
                    doctor.getId(), search != null ? search.toLowerCase() : null);

            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving patients: " + e.getMessage()));
        }
    }

    // Get doctor's appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> getDoctorAppointments(

            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        try {
            System.out.println("Received date parameters - startDate: " + startDate + ", endDate: " + endDate);

            // If no date parameters are provided, skip date parsing
            if ((startDate == null || startDate.isEmpty()) && (endDate == null || endDate.isEmpty())) {
                System.out.println("No date parameters provided, fetching with basic filters only");
                List<Appointment> appointments = appointmentRepository.findByBasicFilters(status, doctor.getId(),
                        patientId);
                return ResponseEntity.ok(appointments);
            }

            // Convert string dates to LocalDateTime if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;

            if (startDate != null && !startDate.isEmpty()) {
                try {
                    // Try parsing the date directly (in case it's already in ISO format)
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

            System.out.println("Using date range: " + startDateTime + " to " + endDateTime);

            List<Appointment> appointments = appointmentRepository.findByFiltersWithDates(
                    status, doctor.getId(), patientId, startDateTime, endDateTime);

            System.out.println("Found " + appointments.size() + " appointments for the query");

            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<?> getAppointmentsToday(
            @RequestParam(required = false) Long doctorId,
            Authentication authentication) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDateRange(doctorId, startOfDay, endOfDay);
        return ResponseEntity.ok(appointments);
    }

    // Complete an appointment and add notes
    @PutMapping("/appointments/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isAppointmentOwner(authentication, #id)")
    public ResponseEntity<?> completeAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus("COMPLETED");
                    appointment.setNotes(payload.get("notes"));
                    appointment.setUpdatedAt(LocalDateTime.now());

                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();
        String newStatus = statusUpdate.get("notes"); // Extract just the status value
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "notes is required"));
        }

        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setNotes(newStatus); // Store just the status value
                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());

    }

    @PutMapping("appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            Authentication authentication

    ) {
        User doctor = (User) authentication.getPrincipal();

        String newStatus = statusUpdate.get("status"); // Extract just the status value
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Status is required"));
        }

        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(newStatus); // Store just the status value
                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());

    }

    @GetMapping("/patients/with-appointments")
    public ResponseEntity<?> getDoctorPatientsFromAppointments(Authentication authentication) {
        User doctor = (User) authentication.getPrincipal();

        List<Patient> patients = appointmentRepository.findDistinctPatientsByDoctorAppointments(doctor.getId());
        return ResponseEntity.ok(patients);
    }

    // Create a prescription
    @PostMapping("/prescriptions/create")
    public ResponseEntity<?> createPrescription(
            @RequestBody Prescription prescription,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        // Set the doctor
        prescription.setDoctor(doctor);

        // Handle appointment ID
        if (prescription.getAppointment() != null && prescription.getAppointment().getAppointmentId() != null) {
            String appointmentIdStr = prescription.getAppointment().getAppointmentId();
            logger.info("Received appointment ID: " + appointmentIdStr);

            // Find appointment by its custom ID (e.g., "APT-ED98AFDE")
            Optional<Appointment> appointmentOpt = appointmentRepository.findByAppointmentId(appointmentIdStr);

            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid appointment ID: " + appointmentIdStr));
            }

            Appointment appointment = appointmentOpt.get();
            prescription.setAppointment(appointment);
        }

        // Generate a unique prescription ID
        prescription.setPrescriptionId("PRS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // Set defaults if not provided
        if (prescription.getPrescriptionDate() == null) {
            prescription.setPrescriptionDate(LocalDate.now());
        }

        if (prescription.getExpiryDate() == null) {
            prescription.setExpiryDate(LocalDate.now().plusMonths(1));
        }

        prescription.setStatus("ACTIVE");

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedPrescription);
    }

    // Get doctor's prescriptions
    @GetMapping("/prescriptions")
    public ResponseEntity<?> getDoctorPrescriptions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        List<Prescription> prescriptions = prescriptionRepository.findByFilters(
                status, doctor.getId(), patientId, startDate, endDate);

        return ResponseEntity.ok(prescriptions);
    }

    // Get a single prescription by ID
    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<?> getPrescriptionById(
            @PathVariable Long id,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        return prescriptionRepository.findById(id)
                .map(prescription -> {
                    // Verify this prescription belongs to the doctor
                    if (!prescription.getDoctor().getId().equals(doctor.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "This prescription does not belong to you"));
                    }
                    return ResponseEntity.ok(prescription);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update a prescription
    @PutMapping("/prescriptions/{id}")
    public ResponseEntity<?> updatePrescription(
            @PathVariable Long id,
            @RequestBody Prescription updatedPrescription,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        return prescriptionRepository.findById(id)
                .map(prescription -> {
                    // Verify this prescription belongs to the doctor
                    if (!prescription.getDoctor().getId().equals(doctor.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "This prescription does not belong to you"));
                    }

                    // Update fields from the request
                    if (updatedPrescription.getMedication() != null) {
                        prescription.setMedication(updatedPrescription.getMedication());
                    }
                    if (updatedPrescription.getDosage() != null) {
                        prescription.setDosage(updatedPrescription.getDosage());
                    }
                    if (updatedPrescription.getFrequency() != null) {
                        prescription.setFrequency(updatedPrescription.getFrequency());
                    }
                    if (updatedPrescription.getDuration() != null) {
                        prescription.setDuration(updatedPrescription.getDuration());
                    }
                    if (updatedPrescription.getInstructions() != null) {
                        prescription.setInstructions(updatedPrescription.getInstructions());
                    }
                    if (updatedPrescription.getNotes() != null) {
                        prescription.setNotes(updatedPrescription.getNotes());
                    }
                    if (updatedPrescription.getStatus() != null) {
                        prescription.setStatus(updatedPrescription.getStatus());
                    }

                    // Save the updated prescription
                    Prescription savedPrescription = prescriptionRepository.save(prescription);
                    return ResponseEntity.ok(savedPrescription);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Discontinue a prescription
    @PutMapping("/prescriptions/{id}/discontinue")
    public ResponseEntity<?> discontinuePrescription(
            @PathVariable Long id,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        return prescriptionRepository.findById(id)
                .map(prescription -> {
                    // Verify this prescription belongs to the doctor
                    if (!prescription.getDoctor().getId().equals(doctor.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "This prescription does not belong to you"));
                    }

                    prescription.setStatus("DISCONTINUED");
                    prescription.setUpdatedAt(LocalDateTime.now());

                    return ResponseEntity.ok(prescriptionRepository.save(prescription));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all beds with optional filtering
    @GetMapping("/beds")
    public ResponseEntity<?> getBeds(
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        try {
            List<Bed> beds;

            // Use the custom filter query if any parameters are provided
            if (ward != null || status != null || search != null) {
                beds = bedRepository.findByFilters(ward, status, search);
            } else {
                // Otherwise get all beds
                beds = bedRepository.findAll();
            }

            return ResponseEntity.ok(beds);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving beds: " + e.getMessage()));
        }
    }

    // Update bed status
    @PutMapping("/beds/{bedId}/status")
    public ResponseEntity<?> updateBedStatus(
            @PathVariable String bedId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        String status = payload.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Status is required"));
        }

        Bed bed = bedRepository.findByBedId(bedId);
        if (bed == null) {
            return ResponseEntity.notFound().build();
        }

        bed.setStatus(status);
        bedRepository.save(bed);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bed " + bedId + " status updated to " + status));
    }

    // Assign patient to bed
    @PutMapping("/beds/{bedId}/assign")
    public ResponseEntity<?> assignPatientToBed(
            @PathVariable String bedId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        String patientId = payload.get("patientId");
        if (patientId == null || patientId.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Patient ID is required"));
        }

        Bed bed = bedRepository.findByBedId(bedId);
        if (bed == null) {
            return ResponseEntity.notFound().build();
        }

        // Find the patient by ID or patientId
        Patient patient = null;
        try {
            Long id = Long.parseLong(patientId);
            patient = patientRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            // If not a numeric ID, try to find by patientId
            patient = patientRepository.findByPatientId(patientId).orElse(null);
        }

        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Patient not found"));
        }

        // Update the bed
        bed.setStatus("Occupied");
        bed.setPatient(patient);
        bed.setDoctor(doctor);
        bed.setAdmissionDate(LocalDate.now().toString());

        // Set diagnosis if provided
        String diagnosis = payload.get("diagnosis");
        if (diagnosis != null && !diagnosis.isEmpty()) {
            bed.setDiagnosis(diagnosis);
        } else {
            bed.setDiagnosis("Under evaluation");
        }

        bedRepository.save(bed);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Patient assigned to bed " + bedId));
    }

    // Discharge patient from bed
    @PutMapping("/beds/{bedId}/discharge")
    public ResponseEntity<?> dischargePatient(
            @PathVariable String bedId,
            Authentication authentication) {

        User doctor = (User) authentication.getPrincipal();

        Bed bed = bedRepository.findByBedId(bedId);
        if (bed == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if bed is occupied
        if (!"Occupied".equals(bed.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Bed is not occupied"));
        }

        // Update the bed
        bed.setStatus("Available");
        bed.setPatient(null);
        bed.setAdmissionDate(null);
        bed.setDiagnosis(null);

        bedRepository.save(bed);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Patient discharged from bed " + bedId));
    }

    // Room endpoints
    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getRooms(
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        List<Room> rooms;

        if (search != null && !search.trim().isEmpty()) {
            rooms = roomRepository.findByNameContainingIgnoreCaseOrNumberContainingIgnoreCase(search, search);
        } else if (ward != null && !ward.trim().isEmpty()) {
            rooms = roomRepository.findByWard(ward);
        } else if (type != null && !type.trim().isEmpty()) {
            rooms = roomRepository.findByType(type);
        } else if (status != null && !status.trim().isEmpty()) {
            rooms = roomRepository.findByStatus(status);
        } else {
            rooms = roomRepository.findAll();
        }

        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<?> getRoomById(@PathVariable String roomId) {
        // Normalize roomId format
        String normalizedRoomId = roomId;
        if (!roomId.startsWith("RM-")) {
            // If it doesn't have the prefix, add it
            normalizedRoomId = "RM-" + roomId;
        }

        // Try to find room by roomId
        Optional<Room> roomOptional = roomRepository.findByRoomId(normalizedRoomId);

        // If not found by roomId, try to find by room number
        if (!roomOptional.isPresent() && !roomId.startsWith("RM-")) {
            // Treat roomId as the room number
            List<Room> rooms = roomRepository.findAll();
            for (Room room : rooms) {
                if (room.getNumber().equals(roomId)) {
                    return ResponseEntity.ok(room);
                }
            }
        }

        if (roomOptional.isPresent()) {
            return ResponseEntity.ok(roomOptional.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Room not found"));
        }
    }

    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(@RequestBody Room room) {
        try {
            // Check if room number already exists
            if (roomRepository.existsByNumber(room.getNumber())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Room number already exists"));
            }

            // Generate room ID
            String roomId = "RM-" + room.getNumber();
            room.setRoomId(roomId);

            // Set initial values
            room.setOccupancy(0);
            if (room.getStatus() == null) {
                room.setStatus("Available");
            }

            // Initialize features list if null
            if (room.getFeatures() == null) {
                room.setFeatures(new ArrayList<>());
            }

            Room savedRoom = roomRepository.save(room);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create room: " + e.getMessage()));
        }
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<?> updateRoom(@PathVariable String roomId, @RequestBody Room roomDetails) {
        // Normalize roomId format
        String normalizedRoomId = roomId;
        if (!roomId.startsWith("RM-")) {
            // If it doesn't have the prefix, add it
            normalizedRoomId = "RM-" + roomId;
        }

        // First try with the normalized ID
        Optional<Room> roomOptional = roomRepository.findByRoomId(normalizedRoomId);

        // If not found and roomId doesn't have prefix, try to find by room number
        if (!roomOptional.isPresent() && !roomId.startsWith("RM-")) {
            List<Room> rooms = roomRepository.findAll();
            for (Room room : rooms) {
                if (room.getNumber().equals(roomId)) {
                    // Update the found room
                    if (roomDetails.getName() != null)
                        room.setName(roomDetails.getName());
                    if (roomDetails.getWard() != null)
                        room.setWard(roomDetails.getWard());
                    if (roomDetails.getType() != null)
                        room.setType(roomDetails.getType());
                    if (roomDetails.getCapacity() > 0)
                        room.setCapacity(roomDetails.getCapacity());
                    if (roomDetails.getNotes() != null)
                        room.setNotes(roomDetails.getNotes());
                    if (roomDetails.getFeatures() != null)
                        room.setFeatures(roomDetails.getFeatures());

                    Room updatedRoom = roomRepository.save(room);
                    return ResponseEntity.ok(updatedRoom);
                }
            }
        }

        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();

            // Update fields
            if (roomDetails.getName() != null)
                room.setName(roomDetails.getName());
            if (roomDetails.getWard() != null)
                room.setWard(roomDetails.getWard());
            if (roomDetails.getType() != null)
                room.setType(roomDetails.getType());
            if (roomDetails.getCapacity() > 0)
                room.setCapacity(roomDetails.getCapacity());
            if (roomDetails.getNotes() != null)
                room.setNotes(roomDetails.getNotes());
            if (roomDetails.getFeatures() != null)
                room.setFeatures(roomDetails.getFeatures());

            Room updatedRoom = roomRepository.save(room);
            return ResponseEntity.ok(updatedRoom);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Room not found"));
        }
    }

    @PutMapping("/rooms/{roomId}/status")
    public ResponseEntity<?> updateRoomStatus(@PathVariable String roomId, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");

        if (status == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Status is required"));
        }

        // Normalize roomId format
        String normalizedRoomId = roomId;
        if (!roomId.startsWith("RM-")) {
            // If it doesn't have the prefix, add it
            normalizedRoomId = "RM-" + roomId;
        }

        // First try with the normalized ID
        Optional<Room> roomOptional = roomRepository.findByRoomId(normalizedRoomId);

        // If not found and roomId doesn't have prefix, try to find by room number
        if (!roomOptional.isPresent() && !roomId.startsWith("RM-")) {
            List<Room> rooms = roomRepository.findAll();
            for (Room room : rooms) {
                if (room.getNumber().equals(roomId)) {
                    room.setStatus(status);
                    Room updatedRoom = roomRepository.save(room);
                    return ResponseEntity.ok(updatedRoom);
                }
            }
        }

        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            room.setStatus(status);

            Room updatedRoom = roomRepository.save(room);
            return ResponseEntity.ok(updatedRoom);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Room not found"));
        }
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable String roomId) {
        // Normalize roomId format
        String normalizedRoomId = roomId;
        if (!roomId.startsWith("RM-")) {
            // If it doesn't have the prefix, add it
            normalizedRoomId = "RM-" + roomId;
        }

        // First try with the normalized ID
        Optional<Room> roomOptional = roomRepository.findByRoomId(normalizedRoomId);

        // If not found and roomId doesn't have prefix, try to find by room number
        if (!roomOptional.isPresent() && !roomId.startsWith("RM-")) {
            List<Room> rooms = roomRepository.findAll();
            for (Room room : rooms) {
                if (room.getNumber().equals(roomId)) {
                    roomRepository.delete(room);
                    return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
                }
            }
        }

        if (roomOptional.isPresent()) {
            roomRepository.delete(roomOptional.get());
            return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Room not found"));
        }
    }
}