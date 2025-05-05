package com.hospital.pharmacy.service;

import com.hospital.pharmacy.model.PasswordResetToken;
import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.PasswordResetTokenRepository;
import com.hospital.pharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;



//    private PasswordResetService resetService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void sendResetLink(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false); // not yet used

        tokenRepository.save(resetToken);

        String resetUrl = "http://localhost:3000/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Reset Password Request");
        message.setText("Click this link to reset your password: " + resetUrl);

        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or missing token"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Token has expired");
        }

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken); // mark token as used
    }
}
