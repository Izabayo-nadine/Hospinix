package com.hospital.pharmacy.filter;

import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.UserRepository;
import com.hospital.pharmacy.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private final List<String> excludedPaths = Arrays.asList(
            "/auth/login",
            "/auth/register",
            "/auth/create-admin",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/h2-console",
            "/swagger-ui",
            "/v3/api-docs");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Invalid token
            }
        }

        if (username != null) {
            Optional<User> userOptional = userRepository.findByEmail(username);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                if (jwtUtil.validateToken(jwt, user)) {
                    request.setAttribute("user", user);
                    request.setAttribute("role", user.getRole());
                }
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return excludedPaths.stream().anyMatch(path::startsWith);
    }
}