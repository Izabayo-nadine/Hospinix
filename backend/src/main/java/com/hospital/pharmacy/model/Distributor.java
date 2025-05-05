package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "distributors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Distributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String distributorId;  // Business ID like "DIST-001"

    @NotBlank
    private String name;

    private String logoUrl;

    private String region;

    private String headquarters;

    @ElementCollection
    @CollectionTable(name = "distributor_areas", joinColumns = @JoinColumn(name = "distributor_id"))
    @Column(name = "area")
    private List<String> areas = new ArrayList<>();

    private String contactName;

    private String contactTitle;

    private String phone;

    private String email;

    private String website;

    private LocalDate relationshipSince;

    private String contractStatus;  // "Active", "On Hold", "Expired", "Pending"

    private LocalDate contractRenewal;

    private String deliveryTime;

    private Double rating;

    private String reliability;  // "Excellent", "Very Good", "Good", "Fair", "Poor"

    private LocalDate lastDelivery;

    private String paymentTerms;  // "Net 30", "Net 45", "Net 60"

    @ElementCollection
    @CollectionTable(name = "distributor_specialties", joinColumns = @JoinColumn(name = "distributor_id"))
    @Column(name = "specialty")
    private List<String> specialties = new ArrayList<>();
} 