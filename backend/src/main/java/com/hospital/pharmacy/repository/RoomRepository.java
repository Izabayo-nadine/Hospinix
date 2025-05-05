package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
   Optional<Room> findByRoomId(String roomId);

    // Optional<Room> findByRoomId(Long id);

    List<Room> findByWard(String ward);
 
    List<Room> findByType(String type);

    List<Room> findByStatus(String status);

    boolean existsByNumber(String number);

    List<Room> findByNameContainingIgnoreCaseOrNumberContainingIgnoreCase(String name, String number);
}