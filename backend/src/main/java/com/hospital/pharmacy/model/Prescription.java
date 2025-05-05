package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String prescriptionId; // Custom ID like PRS-12345

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @NotNull
    private LocalDate prescriptionDate;

    @NotNull
    private LocalDate expiryDate;

    private String status; // ACTIVE, COMPLETED, CANCELLED

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "prescription_id")
    private List<PrescriptionItem> prescriptionItems = new ArrayList<>();

    // Direct fields for simpler prescriptions
    private String medication;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;

    @Column(length = 1000)
    private String notes;

    @Column(length = 1000)
    private String diagnosis;

    private String followUpInstructions;

    private LocalDate followUpDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

@Entity
@Table(name = "prescription_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    private String medicineName;

    @NotBlank
    private String dosage; // e.g., "1 tablet"

    @NotBlank
    private String frequency; // e.g., "Twice daily"

    private String duration; // e.g., "7 days"

    private String instructions; // e.g., "Take after meals"

    private Integer quantity;

    private boolean isFilled = false;

    private LocalDateTime filledAt;

    @ManyToOne
    @JoinColumn(name = "filled_by")
    private User filledBy;
}