package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "billings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String billNumber; // Custom ID like BILL-12345

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    private LocalDate billDate;

    private LocalDate dueDate;

    @NotNull
    @Positive
    private BigDecimal totalAmount;

    private BigDecimal paidAmount = BigDecimal.ZERO;

    private BigDecimal discount = BigDecimal.ZERO;

    private BigDecimal tax = BigDecimal.ZERO;

    @NotNull
    private String status; // PENDING, PAID, PARTIALLY_PAID, CANCELLED

    private String paymentMethod; // CASH, CREDIT_CARD, INSURANCE, BANK_TRANSFER

    @Column(length = 1000)
    private String notes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "bill_id")
    private List<BillingItem> billingItems = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "bill_id")
    private List<Payment> payments = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}