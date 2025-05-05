package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "billing_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String itemType; // CONSULTATION, MEDICINE, LAB_TEST, PROCEDURE

    @NotNull
    private String description;

    @NotNull
    @Positive
    private Integer quantity;

    @NotNull
    @Positive
    private BigDecimal unitPrice;

    @NotNull
    @Positive
    private BigDecimal totalPrice;

    private BigDecimal discount = BigDecimal.ZERO;

    private String notes;
}