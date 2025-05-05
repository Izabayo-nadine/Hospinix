package com.hospital.pharmacy.service;
import com.hospital.pharmacy.model.Appointment;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;
public class AppointmentSpecification {

    public static Specification<Appointment> filterAppointments(
        String status,
        Long doctorId,
        Long patientId,
        LocalDateTime startDate,
        LocalDateTime endDate) {

    return (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        if (doctorId != null) {
            predicates.add(cb.equal(root.get("doctor").get("id"), doctorId));
        }

        if (patientId != null) {
            predicates.add(cb.equal(root.get("patient").get("id"), patientId));
        }

        if (startDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("appointmentDateTime"), startDate));
        }

        if (endDate != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("appointmentDateTime"), endDate));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    };
}

    
}
