package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByMedicineId(String medicineId);

    List<Medicine> findByCategory(String category);

    List<Medicine> findByStockStatus(String stockStatus);

    List<Medicine> findByRequiresPrescription(boolean requiresPrescription);

    @Query("SELECT m FROM Medicine m WHERE " +
            "LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Medicine> searchMedicines(@Param("keyword") String keyword);

    @Query("SELECT m FROM Medicine m WHERE " +
            "(:category IS NULL OR m.category = :category) AND " +
            "(:stockStatus IS NULL OR m.stockStatus = :stockStatus) AND " +
            "(:prescriptionFilter IS NULL OR " +
            "(:prescriptionFilter = 'required' AND m.requiresPrescription = true) OR " +
            "(:prescriptionFilter = 'not-required' AND m.requiresPrescription = false))")

            
    List<Medicine> findWithFilters(
            @Param("category") String category,
            @Param("stockStatus") String stockStatus,
            @Param("prescriptionFilter") String prescriptionFilter);

    List<Medicine> findByExpiryDateBefore(java.time.LocalDate date);

    List<Medicine> findByStockLessThan(Integer stockThreshold);
}