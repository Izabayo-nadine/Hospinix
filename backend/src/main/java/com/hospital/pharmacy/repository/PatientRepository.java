package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Patient;
import com.hospital.pharmacy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

        Optional<Patient> findByPatientId(String patientId);

        List<Patient> findByAssignedDoctor(User doctor);

        List<Patient> findByStatus(String status);

        @Query("SELECT p FROM Patient p WHERE " +
                        "(:status IS NULL OR LENGTH(CAST(:status AS string)) = 0 OR p.status = :status) AND " +
                        "(:doctorId IS NULL OR p.assignedDoctor.id = :doctorId) AND " +
                        "(:searchTerm IS NULL OR LENGTH(CAST(:searchTerm AS string)) = 0 OR " +
                        "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(p.patientId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
        List<Patient> findByFilters(
                        @Param("status") String status,
                        @Param("doctorId") Long doctorId,
                        @Param("searchTerm") String searchTerm);

        @Query(value = "SELECT * FROM patients p WHERE " +
                        "(:status IS NULL OR p.status = :status) AND " +
                        "(:doctorId IS NULL OR p.assigned_doctor_id = :doctorId) AND " +
                        "(:searchTerm IS NULL OR " +
                        "CAST(p.firstname AS text) LIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                        "CAST(p.lastname AS text) LIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                        "CAST(p.patientid AS text) LIKE CONCAT('%', CAST(:searchTerm AS text), '%') OR " +
                        "CAST(p.phonenumber AS text) LIKE CONCAT('%', CAST(:searchTerm AS text), '%'))", nativeQuery = true)
        List<Patient> findByFiltersNative(
                        @Param("status") String status,
                        @Param("doctorId") Long doctorId,
                        @Param("searchTerm") String searchTerm);

        @Query("SELECT p FROM Patient p WHERE " +
                        "p.insuranceProvider LIKE CONCAT('%', :provider, '%')")
        List<Patient> findByInsuranceProvider(@Param("provider") String provider);

        @Query("SELECT COUNT(p) FROM Patient p")
        long countTotalPatients();

        @Query("SELECT COUNT(p) FROM Patient p WHERE p.assignedDoctor.id = :doctorId")
        long countPatientsByDoctor(@Param("doctorId") Long doctorId);
}