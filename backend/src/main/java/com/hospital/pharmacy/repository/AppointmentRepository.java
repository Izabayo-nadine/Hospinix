package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Appointment;
import com.hospital.pharmacy.model.Patient;
import com.hospital.pharmacy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentId(String appointmentId);

    List<Appointment> findByDoctor(User doctor);

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByStatus(String status);

    List<Appointment> findByDoctorAndStatus(User doctor, String status);

    List<Appointment> findByPatientAndStatus(Patient patient, String status);

    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
            "a.appointmentDateTime BETWEEN :start AND :end")
    List<Appointment> findByDoctorAndDateRange(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
            "(:patientId IS NULL OR a.patient.id = :patientId) AND " +
            "(:startDate IS NULL OR a.appointmentDateTime >= :startDate) AND " +
            "(:endDate IS NULL OR a.appointmentDateTime <= :endDate)")
    List<Appointment> findByFiltersWithDates(
            @Param("status") String status,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
            "a.doctor.id = :doctorId AND a.status = :status")
    long countByDoctorAndStatus(
            @Param("doctorId") Long doctorId,
            @Param("status") String status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
            "a.doctor.id = :doctorId AND " +
            "a.appointmentDateTime BETWEEN :startOfDay AND :endOfDay")
    long countTodaysAppointmentsByDoctor(
            @Param("doctorId") Long doctorId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a WHERE a.doctor.id = :doctorId")
    long countDistinctPatientsByDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) FROM Appointment a")
    long countTotalAppointments();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
            "a.appointmentDateTime BETWEEN :start AND :end")
    long countAppointmentsBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Find appointments using only basic filters (no date parameters)
    // to avoid PostgreSQL JDBC parameter type issues
    @Query("SELECT a FROM Appointment a WHERE " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
            "(:patientId IS NULL OR a.patient.id = :patientId)")
    List<Appointment> findByBasicFilters(
            @Param("status") String status,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId);

    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.id = :doctorId")
    List<Patient> findDistinctPatientsByDoctorAppointments(@Param("doctorId") Long doctorId);

    @Query("""
                SELECT DISTINCT a.patient FROM Appointment a
                WHERE a.doctor.id = :doctorId
                AND (:search IS NULL OR LOWER(CONCAT(a.patient.firstName, ' ', a.patient.lastName)) LIKE %:search%)
            """)
    List<Patient> findDistinctPatientsByDoctorIdAndSearch(@Param("doctorId") Long doctorId,
            @Param("search") String search);

}