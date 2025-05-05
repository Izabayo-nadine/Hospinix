// package com.hospital.pharmacy.service.impl;

// import com.hospital.pharmacy.model.PasswordResetToken;
// import com.hospital.pharmacy.model.User;
// import com.hospital.pharmacy.repository.PasswordResetTokenRepository;
// import com.hospital.pharmacy.repository.UserRepository;
// import com.hospital.pharmacy.service.EmailService;
// import com.hospital.pharmacy.service.PasswordService;
// // import com.hospital.pharmacy.util.PasswordUtil;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.Optional;
// import java.util.UUID;

// @Service
// public class PasswordServiceImpl implements PasswordService {

//     private static final Logger logger = LoggerFactory.getLogger(PasswordServiceImpl.class);
//     private static final int EXPIRATION_MINUTES = 30;

//     // @Autowired
//     // private PasswordUtil passwordUtil;

//     @Autowired
//     private PasswordResetTokenRepository tokenRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private EmailService emailService;

//     @Value("${spring.mail.enabled:false}")
//     private boolean emailEnabled;

//     @Value("${app.frontend.url:http://localhost:3000}")
//     private String frontendUrl;

//     @Override
//     public boolean checkPassword(String rawPassword, String encodedPassword) {
//         return passwordUtil.checkPassword(rawPassword, encodedPassword);
//     }

//     @Override
//     public String encodePassword(String rawPassword) {
//         return passwordUtil.hashPassword(rawPassword);
//     }

//     @Override
//     @Transactional
//     public void createPasswordResetTokenForUser(User user) {
//         // Check if there's an existing unused token for this user
//         Optional<PasswordResetToken> existingToken = tokenRepository.findByUserAndUsedFalse(user);

//         // If there's an existing token, invalidate it
//         existingToken.ifPresent(token -> {
//             token.setUsed(true);
//             tokenRepository.save(token);
//         });

//         // Create a new token
//         String token = UUID.randomUUID().toString();
//         PasswordResetToken resetToken = new PasswordResetToken();
//         resetToken.setToken(token);
//         resetToken.setUser(user);
//         resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));
//         resetToken.setUsed(false);

//         tokenRepository.save(resetToken);

//         // Send email if email service is enabled
//         if (emailEnabled) {
//             try {
//                 String resetLink = frontendUrl + "/reset-password?token=" + token;
//                 emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
//             } catch (Exception e) {
//                 // Log the error but don't fail the token creation
//                 logger.error("Error sending reset email: {}", e.getMessage());
//             }
//         } else {
//             logger.warn("Email service is disabled. Reset token: {}", token);
//         }
//     }

//     @Override
//     public boolean validatePasswordResetToken(String token) {
//         Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);

//         if (tokenOpt.isEmpty()) {
//             logger.warn("Invalid password reset token: {}", token);
//             return false;
//         }

//         PasswordResetToken resetToken = tokenOpt.get();

//         if (resetToken.isExpired()) {
//             logger.warn("Expired password reset token: {}", token);
//             return false;
//         }

//         if (resetToken.isUsed()) {
//             logger.warn("Used password reset token: {}", token);
//             return false;
//         }

//         return true;
//     }

//     @Override
//     public User getUserByPasswordResetToken(String token) {
//         Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
//         return tokenOpt.map(PasswordResetToken::getUser).orElse(null);
//     }

//     @Override
//     @Transactional
//     public void changeUserPassword(User user, String newPassword) {
//         user.setPassword(encodePassword(newPassword));
//         userRepository.save(user);

//         // Mark all unused tokens for this user as used
//         Optional<PasswordResetToken> tokenOpt = tokenRepository.findByUserAndUsedFalse(user);
//         tokenOpt.ifPresent(token -> {
//             token.setUsed(true);
//             tokenRepository.save(token);
//         });
//     }
// }