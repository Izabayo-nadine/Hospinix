package com.hospital.pharmacy.service;

import com.hospital.pharmacy.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findByFilters(String role, Boolean isActive, String search);
    Optional<User> findById(Long id);
    User save(User user);
    User update(Long id, User updatedUser);
    void delete(User user);
    long countByRole(String role);
} 