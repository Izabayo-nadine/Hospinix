package com.hospital.pharmacy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String number;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String ward;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private int occupancy;

    @Column(nullable = false)
    private String status;

    @ElementCollection
    private List<String> features;

    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}