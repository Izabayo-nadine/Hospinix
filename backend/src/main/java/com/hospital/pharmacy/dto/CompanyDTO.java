package com.hospital.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDTO {
    private Long id;
    private String companyId;
    private String name;
    private String address;
    private String contactPerson;
    private String phone;
    private String email;
    private String website;
    private String licenseNumber;
    private LocalDate registrationDate;

}