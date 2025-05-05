package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "beds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String bedId;

    @Column(nullable = false)
    private String wardName;

    @Column(nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String bedNumber;

    @Column(nullable = false)
    private String status; // Available, Occupied, Maintenance, Reserved

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column
    private String admissionDate;

    @Column
    private String diagnosis;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
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