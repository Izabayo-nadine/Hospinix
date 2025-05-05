package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Patient;
import com.hospital.pharmacy.model.Prescription;
import com.hospital.pharmacy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByPrescriptionId(String prescriptionId);

    List<Prescription> findByPatient(Patient patient);

    List<Prescription> findByDoctor(User doctor);

    List<Prescription> findByPatientAndStatus(Patient patient, String status);

    List<Prescription> findByDoctorAndStatus(User doctor, String status);

    List<Prescription> findByStatus(String status);

    @Query("SELECT p FROM Prescription p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(:doctorId IS NULL OR p.doctor.id = :doctorId) AND " +
            "(:patientId IS NULL OR p.patient.id = :patientId) AND " +
            "(:startDate IS NULL OR p.prescriptionDate >= :startDate) AND " +
            "(:endDate IS NULL OR p.prescriptionDate <= :endDate)")
    List<Prescription> findByFilters(
            @Param("status") String status,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId")
    long countByDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.patient.id = :patientId")
    long countByPatient(@Param("patientId") Long patientId);
}