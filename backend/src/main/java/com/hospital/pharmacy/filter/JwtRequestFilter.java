package com.hospital.pharmacy.filter;

import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.UserRepository;
import com.hospital.pharmacy.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private final List<String> excludedPaths = Arrays.asList(
            "/auth/login",
            "/auth/register",
            "/error",
            "/auth/create-admin",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/h2-console",
            "/swagger-ui",
            "/v3/api-docs");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        logger.info("doFilterInternal");
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        logger.info("Authorization header: " + authorizationHeader);
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                logger.info("found jwt token");
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                logger.error("Error extracting username from token", e);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        logger.info("username: " + username);
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.info("found user before searching");
            Optional<User> userOptional = userRepository.findByEmail(username);
            logger.info("found user: " + userOptional.isPresent());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                logger.info("found user after searching");
                if (jwtUtil.validateToken(jwt, user)) {
                    // Set request attributes (optional, if needed elsewhere)
                    request.setAttribute("user", user);
                    request.setAttribute("role", user.getRole());

                    // Create authorities (e.g., ROLE_RECEPTIONIST)
                    List<SimpleGrantedAuthority> authorities = Arrays.stream(user.getRole().split(","))
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                            .collect(Collectors.toList());

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    authToken.setDetails(new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authentication set for user: " + username + ", role: " + user.getRole());
                } else {
                    logger.info("Token validation failed");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } else {
                logger.info("User not found in database");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
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