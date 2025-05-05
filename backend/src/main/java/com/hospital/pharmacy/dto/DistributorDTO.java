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
public class DistributorDTO {
    private Long id;
    private String distributorId;
    private String name;
    private String logoUrl;
    private String region;
    private String headquarters;
    private List<String> areas = new ArrayList<>();
    private String contactName;
    private String contactTitle;
    private String phone;
    private String email;
    private String website;
    private LocalDate relationshipSince;
    private String contractStatus;
    private LocalDate contractRenewal;
    private String deliveryTime;
    private Double rating;
    private String reliability;
    private LocalDate lastDelivery;
    private String paymentTerms;
    private List<String> specialties = new ArrayList<>();
}