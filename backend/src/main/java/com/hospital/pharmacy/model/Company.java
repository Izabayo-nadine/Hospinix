package com.hospital.pharmacy.model;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.time.LocalDate;
@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String companyId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    private String website;

    @Column(name = "contact_person")
    private String contactPerson;

    private String status;

    private LocalDate registrationDate;

    // @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    // private List<Medicine> medicines;
}