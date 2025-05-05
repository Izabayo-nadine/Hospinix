// package com.hospital.pharmacy.service.impl;

// import com.hospital.pharmacy.service.EmailService;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.stereotype.Service;

// @Service
// public class EmailServiceImpl implements EmailService {

//     private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

//     @Autowired(required = false)
//     private JavaMailSender emailSender;
    
//     @Value("${spring.mail.enabled:false}")
//     private boolean mailEnabled;

//     @Override
//     public void sendPasswordResetEmail(String toEmail, String resetLink) {
//         if (!mailEnabled || emailSender == null) {
//             logger.warn("Email service is disabled or not configured. Would send reset link to {}: {}", toEmail, resetLink);
//             return;
//         }
        
//         try {
//             SimpleMailMessage message = new SimpleMailMessage();
//             message.setTo(toEmail);
//             message.setSubject("Hospital Pharmacy - Password Reset");
//             message.setText("To reset your password, click the link below:\n\n" 
//                     + resetLink 
//                     + "\n\nThis link will expire in 30 minutes. If you did not request a password reset, please ignore this email.");

//             emailSender.send(message);
//             logger.info("Password reset email sent to: {}", toEmail);
//         } catch (Exception e) {
//             logger.error("Failed to send password reset email to: {}", toEmail, e);
//             throw new RuntimeException("Failed to send password reset email", e);
//         }
//     }
// }