package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

        Optional<User> findByEmail(String email);

        Optional<User> findByUserId(String userId);

        List<User> findByRole(String role);

        boolean existsByEmail(String email);

        // Method to find users by role and isActive status
        List<User> findByRoleAndIsActive(String role, Boolean isActive);

        // Method to find users by role with firstName, lastName, or email containing
        // searchTerm
        List<User> findByRoleAndFirstNameContainingIgnoreCaseOrRoleAndLastNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                        String role1, String firstName,
                        String role2, String lastName,
                        String role3, String email);

        // Custom implementation for findByFilters to replace the problematic JPQL query
        default List<User> findByFilters(String role, Boolean isActive, String searchTerm) {
                if (searchTerm != null && !searchTerm.isEmpty()) {
                        if (role != null) {
                                // Search with role filter
                                return findByRoleAndFirstNameContainingIgnoreCaseOrRoleAndLastNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                                                role, searchTerm, role, searchTerm, role, searchTerm);
                        } else {
                                // Search without role filter
                                return findAll().stream()
                                                .filter(user -> (isActive == null || (user.isActive() == isActive)) &&
                                                                (user.getFirstName().toLowerCase()
                                                                                .contains(searchTerm.toLowerCase()) ||
                                                                                user.getLastName().toLowerCase()
                                                                                                .contains(searchTerm
                                                                                                                .toLowerCase())
                                                                                ||
                                                                                user.getEmail().toLowerCase().contains(
                                                                                                searchTerm.toLowerCase())))
                                                .toList();
                        }
                } else if (role != null && isActive != null) {
                        // Filter by role and active status
                        return findByRoleAndIsActive(role, isActive);
                } else if (role != null) {
                        // Filter by role only
                        return findByRole(role);
                } else if (isActive != null) {
                        // Filter by active status only
                        return findAll().stream()
                                        .filter(user -> user.isActive() == isActive)
                                        .toList();
                } else {
                        // No filters, return all
                        return findAll();
                }
        }

        @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
        long countByRole(@Param("role") String role);
}