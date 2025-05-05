package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private LocalDateTime paymentDate;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private String paymentMethod; // CASH, CREDIT_CARD, INSURANCE, BANK_TRANSFER

    private String referenceNumber;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "received_by")
    private User receivedBy;
}