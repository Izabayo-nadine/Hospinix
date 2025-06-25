package com.hospital.pharmacy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.Properties;

import com.hospital.pharmacy.filter.JwtRequestFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtRequestFilter jwtRequestFilter)
                        throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers(
                                                                "/auth/login",
                                                                "/auth/register",
                                                                "/auth/create-admin",
                                                                "/auth/forgot-password",
                                                                "/auth/reset-password",
                                                                "/error",
                                                                "/h2-console/**",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // Role-based endpoints
                                                .requestMatchers("/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/doctor/**").hasRole("DOCTOR")
                                                .requestMatchers("/pharmacist/**").hasRole("PHARMACIST")
                                                .requestMatchers("/receptionist/**").hasRole("RECEPTIONIST")

                                                // Allow OPTIONS requests for CORS
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // All other requests need authentication
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public JavaMailSender getJavaMailSender() {
                JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
                mailSender.setHost("smtp.gmail.com");
                mailSender.setPort(587);
                mailSender.setUsername("izabayonadine08@gmail.com");
                mailSender.setPassword("fvxm mixt bqpy dgfv");

                Properties props = mailSender.getJavaMailProperties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.debug", "true");

                return mailSender;
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}