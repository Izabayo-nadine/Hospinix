package com.hospital.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDTO {
    private Long id;
    private String medicineId;
    private String name;
    private String category;
    private String description;
    private String manufacturer;
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer stock;
    private String stockStatus;
    private BigDecimal price;
    private boolean requiresPrescription;
    private String dosageForm;
    private String strength;
    private List<String> interactions = new ArrayList<>();
    private List<String> sideEffects = new ArrayList<>();
    private String companyId;
    private String companyName;
} 