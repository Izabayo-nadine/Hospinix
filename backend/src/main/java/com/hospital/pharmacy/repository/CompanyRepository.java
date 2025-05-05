package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCompanyId(String companyId);

    Optional<Company> findByName(String name);

    @Query("SELECT c FROM Company c WHERE " +
            "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:status IS NULL OR c.status = :status)")
    List<Company> findWithFilters(@Param("name") String name,
            @Param("status") String status);

    @Query("SELECT c FROM Company c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Company> searchCompanies(@Param("query") String query);

//    @Query("SELECT DISTINCT c FROM Company c JOIN c.medicines m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :medicineName, '%'))")
//    List<Company> findByMedicineName(@Param("medicineName") String medicineName);

    List<Company> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    boolean existsByCompanyId(String companyId);

    boolean existsByName(String name);

    boolean existsByEmail(String email);
}