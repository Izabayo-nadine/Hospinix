package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {

        // Find billing by billNumber
        Billing findByBillNumber(String billNumber);

        // Find billings by patient ID
        List<Billing> findByPatientId(Long patientId);

        // Find billings by status
        List<Billing> findByStatus(String status);

        // Find billings by date range
        List<Billing> findByBillDateBetween(LocalDate startDate, LocalDate endDate);

        // Find billings with multiple filters
        @Query("SELECT b FROM Billing b WHERE " +
                        "(:patientId IS NULL OR b.patient.id = :patientId) AND " +
                        "(:status IS NULL OR b.status = :status) AND " +
                        "(:startDate IS NULL OR b.billDate >= :startDate) AND " +
                        "(:endDate IS NULL OR b.billDate <= :endDate)")
        List<Billing> findByFilters(
                        @Param("patientId") Long patientId,
                        @Param("status") String status,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);
}