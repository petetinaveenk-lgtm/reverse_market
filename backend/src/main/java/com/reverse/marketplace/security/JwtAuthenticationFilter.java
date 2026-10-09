package com.reverse.marketplace.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final Set<String> ALLOWED_ROLES =
            Set.of("CUSTOMER", "SELLER", "ADMIN");

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return "/api/users/login".equals(path)
                || "/api/users/register".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(token)) {
                logger.warn("Rejected invalid or expired JWT");
                rejectInvalidToken(response);
                return;
            }

            String email = jwtService.extractEmail(token);
            String role = normalizeRole(jwtService.extractRole(token));

            if (email == null || email.isBlank() || role == null) {
                rejectInvalidToken(response);
                return;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("JWT authentication failed: {}", e.getClass().getSimpleName());
            rejectInvalidToken(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return null;
        }

        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring("ROLE_".length());
        }

        return ALLOWED_ROLES.contains(normalizedRole) ? normalizedRole : null;
    }

    private void rejectInvalidToken(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT");
    }
}