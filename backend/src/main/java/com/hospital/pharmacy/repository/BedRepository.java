package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Bed;
import com.hospital.pharmacy.model.Patient;
import com.hospital.pharmacy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    // Find beds by ward name
    List<Bed> findByWardName(String wardName);

    // Find beds by status
    List<Bed> findByStatus(String status);

    // Find beds by patient
    List<Bed> findByPatient(Patient patient);

    // Find beds by doctor
    List<Bed> findByDoctor(User doctor);

    // Find beds by bed ID
    Bed findByBedId(String bedId);

    // Custom query to find beds with filtering
    @Query("SELECT b FROM Bed b WHERE " +
            "(:ward IS NULL OR b.wardName = :ward) AND " +
            "(:status IS NULL OR b.status = :status) AND " +
            "(:search IS NULL OR b.bedId LIKE %:search% OR " +
            "b.roomNumber LIKE %:search% OR " +
            "(b.patient IS NOT NULL AND " +
            "(b.patient.firstName LIKE %:search% OR " +
            "b.patient.lastName LIKE %:search% OR " +
            "b.patient.patientId LIKE %:search%)))")
    List<Bed> findByFilters(@Param("ward") String ward,
            @Param("status") String status,
            @Param("search") String search);
}