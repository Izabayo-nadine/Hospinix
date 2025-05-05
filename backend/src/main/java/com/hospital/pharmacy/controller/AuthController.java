package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.UserRepository;

import com.hospital.pharmacy.service.PasswordResetService;
import com.hospital.pharmacy.util.JwtUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetService resetService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        logger.info("Login attempt for email: {}", email);
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Check if password is encrypted (if it's not, this is a legacy account)

            String token = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("userId", user.getUserId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());

            logger.info("User with email {} logged in successfully", email);
            return ResponseEntity.ok(response);
        }

        logger.warn("No user found with email: {}", email);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already in use"));
        }

        // Generate a unique userId based on role
        String userId;
        switch (user.getRole().toUpperCase()) {
            case "DOCTOR":
                userId = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            case "PHARMACIST":
                userId = "PHM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            case "RECEPTIONIST":
                userId = "RCP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            case "ADMIN":
                userId = "ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                break;
            default:
                userId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        user.setUserId(userId);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);


        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", savedUser.getUserId());
        response.put("firstName", savedUser.getFirstName());
        response.put("lastName", savedUser.getLastName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try{
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // String username = jwtUtil.extractUsername(token);
         String userId = jwtUtil.extractUserId(token);

            // Optional<User> userOptional = userRepository.findByEmail(username);
            // if (userOptional.isPresent()) {
            Optional<User> userOptional = userRepository.findByUserId(userId);
            if(userOptional.isPresent()&& jwtUtil.validateToken(token, userOptional.get())){
            User user = userOptional.get();

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);
            }
        }


        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "message", "Invalid token"));

} catch (Exception e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Invalid token"));
}}




    @PostMapping("/create-admin")
    public ResponseEntity<?> createInitialAdmin() {
        // Check if any admin exists
        long adminCount = userRepository.countByRole("ADMIN");

        if (adminCount > 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Admin user already exists"));
        }

        User admin = new User();
        admin.setUserId("ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setEmail("admin@hospital.com");
        admin.setPassword("admin123");

        // Encrypt the admin password

        admin.setRole("ADMIN");
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        admin.setActive(true);

        User savedAdmin = userRepository.save(admin);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Initial admin created successfully",
                        "email", savedAdmin.getEmail(),
                        "password", "admin123"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        resetService.sendResetLink(payload.get("email"));
        return ResponseEntity.ok(Map.of("message", "Reset link sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        resetService.resetPassword(payload.get("token"), payload.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}