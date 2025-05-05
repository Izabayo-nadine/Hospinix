// package com.hospital.pharmacy.util;

// import org.mindrot.jbcrypt.BCrypt;
// import org.springframework.stereotype.Component;

// /**
//  * Utility class for handling password hashing and verification
//  * using BCrypt algorithm instead of Spring Security.
//  */
// @Component
// public class PasswordUtil {

//     /**
//      * Hash a password using BCrypt.
//      * 
//      * @param plainTextPassword the password to hash
//      * @return the hashed password
//      */
//     public String hashPassword(String plainTextPassword) {
//         return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(12));
//     }

//     /**
//      * Verify a password against a hash.
//      * 
//      * @param plainTextPassword the password to check
//      * @param hashedPassword the hash to check against
//      * @return true if the password matches the hash, false otherwise
//      */
//     public boolean checkPassword(String plainTextPassword, String hashedPassword) {
//         try {
//             return BCrypt.checkpw(plainTextPassword, hashedPassword);
//         } catch (Exception e) {
//             // If the stored hash is not in BCrypt format, return false
//             return false;
//         }
//     }
    
//     /**
//      * Check if a password looks like a BCrypt hash
//      * 
//      * @param password the string to check
//      * @return true if the string looks like a BCrypt hash
//      */
//     public boolean isPasswordHashed(String password) {
//         return password != null && password.startsWith("$2a$");
//     }
// } 