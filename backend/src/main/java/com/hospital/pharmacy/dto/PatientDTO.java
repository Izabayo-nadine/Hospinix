package com.hospital.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long id;
    private String patientId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String email;
    private String phoneNumber;
    private String address;
    private String bloodGroup;
    private Double height;
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceExpiryDate;
    private String occupation;
    private String maritalStatus;
    private Long assignedDoctorId;
    private String assignedDoctorName;
    private LocalDateTime registrationDate;
    private LocalDateTime lastVisitDate;
    private String medicalHistory;
    private String status;
    private List<String> currentMedications = new ArrayList<>();
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class PatientCreateDTO {
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String email;
    private String phoneNumber;
    private String address;
    private String bloodGroup;
    private Double height;
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceExpiryDate;
    private String occupation;
    private String maritalStatus;
    private Long assignedDoctorId;
    private String medicalHistory;
    private List<String> currentMedications = new ArrayList<>();
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class PatientUpdateDTO {
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String email;
    private String phoneNumber;
    private String address;
    private String bloodGroup;
    private Double height;
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceExpiryDate;
    private String occupation;
    private String maritalStatus;
    private Long assignedDoctorId;
    private String medicalHistory;
    private String status;
    private List<String> currentMedications = new ArrayList<>();
}