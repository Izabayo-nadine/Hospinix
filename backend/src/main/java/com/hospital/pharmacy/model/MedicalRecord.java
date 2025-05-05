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
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String recordId; // Custom ID like MR-12345

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
    private LocalDate recordDate;

    @NotBlank
    @Column(length = 1000)
    private String chiefComplaint;

    @Column(length = 2000)
    private String diagnosis;

    @Column(length = 2000)
    private String treatment;

    @Column(length = 1000)
    private String notes;

    @ElementCollection
    @CollectionTable(name = "medical_record_vitals", joinColumns = @JoinColumn(name = "record_id"))
    private List<Vital> vitals = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "medical_record_lab_results", joinColumns = @JoinColumn(name = "record_id"))
    private List<LabResult> labResults = new ArrayList<>();

    private String attachmentsUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
class Vital {
    private String name; // BP, Temp, Pulse, etc.
    private String value;
    private String unit;
    private LocalDateTime recordedAt = LocalDateTime.now();
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
class LabResult {
    private String testName;
    private String result;
    private String normalRange;
    private String unit;
    private LocalDate testDate;
    private String status; // Normal, Abnormal
    private String notes;
}