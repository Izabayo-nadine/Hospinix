package com.hospital.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String phoneNumber;
    private String address;
    private String gender;
    private String profileImage;
    private String specialization;
    private String licenseNumber;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class UserCreateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;
    private String address;
    private String gender;
    private String specialization;
    private String licenseNumber;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class UserUpdateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String gender;
    private String specialization;
    private String licenseNumber;
    private boolean isActive;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class UserLoginDTO {
    private String email;
    private String password;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class UserResponseDTO {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String token;
}