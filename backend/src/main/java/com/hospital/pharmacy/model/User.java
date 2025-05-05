package com.hospital.pharmacy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.groups.Default;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Validation groups to determine when validation should be applied
 */
interface CreateValidation extends Default {
}

interface UpdateValidation extends Default {
}

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userId;

    // Only validate on create
    @NotBlank(groups = CreateValidation.class)
    @Size(min = 3, max = 50)
    private String firstName;

    // Only validate on create
    @NotBlank(groups = CreateValidation.class)
    @Size(min = 3, max = 50)
    private String lastName;

    // Only validate on create
    @NotBlank(groups = CreateValidation.class)
    @Email
    @Column(unique = true)
    private String email;

    // Only validate on create
    @NotBlank(groups = CreateValidation.class)
    @Size(min = 6)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // Only validate on create
    @NotBlank(groups = CreateValidation.class)
    @Column(nullable = false)
    private String role; // ADMIN, DOCTOR, PHARMACIST, RECEPTIONIST

    private String phoneNumber;

    private String address;

    private String gender;

    private String profileImage;

    private String specialization; // For doctors

    private String licenseNumber; // For doctors and pharmacists

    private String qualification; // For pharmacists

    private String shift; // For pharmacists (Morning, Evening, Night, Rotating)

    @Column(name = "isactive", nullable = false)
    private Boolean isActive = true;

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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive != null ? isActive : true;
    }

    public boolean isActive() {
        return isActive != null ? isActive : true;
    }

    public void setActive(Boolean active) {
        this.isActive = active != null ? active : true;
    }

    // Explicit getters and setters for qualification
    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    // Explicit getters and setters for shift
    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }
}