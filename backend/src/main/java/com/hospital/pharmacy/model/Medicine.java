package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String medicineId;  // Business ID like "MED-001"

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @Column(length = 1000)
    private String description;

    private String manufacturer;

    private String batchNumber;

    @NotNull
    private LocalDate expiryDate;

    @NotNull
    @Positive
    private Integer stock;

    private String stockStatus;  // "High", "Normal", "Low", "Critical"

    @NotNull
    @Positive
    private BigDecimal price;

    private boolean requiresPrescription;

    private String dosageForm;  // "Tablet", "Capsule", "Syrup", etc.

    private String strength;  // "10mg", "500mg", etc.

    @ElementCollection
    @CollectionTable(name = "medicine_interactions", joinColumns = @JoinColumn(name = "medicine_id"))
    @Column(name = "interaction")
    private List<String> interactions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "medicine_side_effects", joinColumns = @JoinColumn(name = "medicine_id"))
    @Column(name = "side_effect")
    private List<String> sideEffects = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "distributor_id")
    private Distributor distributor;
} 