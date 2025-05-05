package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patientid", unique = true, nullable = false)
    private String patientId; // Custom ID like PAT-12345

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(name = "firstname")
    private String firstName;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(name = "lastname")
    private String lastName;

    @Past
    @Column(name = "dateofbirth")
    private LocalDate dateOfBirth;

    @NotBlank
    private String gender;

    @Email
    private String email;

    @Column(name = "phonenumber")
    private String phoneNumber;

    private String address;

    private String bloodGroup;

    private Double height; // in cm

    private Double weight; // in kg

    @Column(length = 1000)
    private String allergies;

    @Column(length = 1000)
    private String chronicDiseases;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String emergencyContactRelation;

    private String insuranceProvider;

    private String insurancePolicyNumber;

    private String insuranceExpiryDate;

    private String occupation;

    private String maritalStatus;

    @ManyToOne
    @JoinColumn(name = "assigned_doctor_id")
    private User assignedDoctor;

    private LocalDateTime registrationDate;

    private LocalDateTime lastVisitDate;

    @Column(length = 2000)
    private String medicalHistory;

    private String status; // Active, Discharged, Deceased

    @ElementCollection
    @CollectionTable(name = "patient_medications", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "medication")
    private List<String> currentMedications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
        lastVisitDate = LocalDateTime.now();
        if (status == null) {
            status = "Active";
        }
    }
}