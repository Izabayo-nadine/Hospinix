package com.hospital.pharmacy.service.impl;

import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.UserRepository;
import com.hospital.pharmacy.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;


    @Override
    public List<User> findByFilters(String role, Boolean isActive, String search) {
        return userRepository.findByFilters(role, isActive, search);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User update(Long id, User updatedUser) {
        logger.info("Updating user with ID: {}", id);

        return userRepository.findById(id)
                .map(user -> {
                    // Keep track of original values for required fields
                    String originalPassword = user.getPassword();

                    // Update fields if provided, otherwise keep original values
                    if (updatedUser.getFirstName() != null && !updatedUser.getFirstName().isEmpty()) {
                        user.setFirstName(updatedUser.getFirstName());
                    }

                    if (updatedUser.getLastName() != null && !updatedUser.getLastName().isEmpty()) {
                        user.setLastName(updatedUser.getLastName());
                    }

                    if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                        user.setEmail(updatedUser.getEmail());
                    }

                    if (updatedUser.getRole() != null && !updatedUser.getRole().isEmpty()) {
                        user.setRole(updatedUser.getRole());
                    }

                    // Optional fields can be null
                    user.setPhoneNumber(updatedUser.getPhoneNumber());
                    user.setAddress(updatedUser.getAddress());
                    user.setGender(updatedUser.getGender());
                    user.setSpecialization(updatedUser.getSpecialization());
                    user.setLicenseNumber(updatedUser.getLicenseNumber());
                    user.setQualification(updatedUser.getQualification());
                    user.setShift(updatedUser.getShift());

                    // Critical: Don't overwrite password with null
                     // Keep original password
                     if (updatedUser.getPassword() == null || updatedUser.getPassword().isEmpty()) {
                        user.setPassword(originalPassword);
                    }else{
                        user.setPassword(updatedUser.getPassword());
                    }

                    // Handle isActive separately to avoid null
                    if (updatedUser.getIsActive() != null) {
                        user.setIsActive(updatedUser.getIsActive());
                    }

                    user.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

    }

    @Override
    @Transactional
    public void delete(User user) {
        userRepository.delete(user);
    }

    @Override
    public long countByRole(String role) {
        return userRepository.countByRole(role);
    }



}