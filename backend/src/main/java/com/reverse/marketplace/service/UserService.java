package com.reverse.marketplace.service;

import com.reverse.marketplace.entity.User;
import com.reverse.marketplace.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminRegistrationKey;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.registration-key:}")
            String adminRegistrationKey) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminRegistrationKey = adminRegistrationKey;
    }

    // ==========================================
    // REGISTER USER
    // ==========================================

    public User registerUser(User user, String suppliedAdminRegistrationKey) {

        System.out.println("========== USER SERVICE ==========");

        // Check name
        if (user.getName() == null ||
                user.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Name is required"
            );
        }

        // Check email
        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        // Check password
        if (user.getPassword() == null ||
                user.getPassword().trim().isEmpty()) {

            System.out.println(
                    "ERROR: Password is NULL or empty"
            );

            throw new RuntimeException(
                    "Password is required"
            );
        }

        // Check role
        if (!"CUSTOMER".equals(user.getRole())
                && !"SELLER".equals(user.getRole())
                && !"ADMIN".equals(user.getRole())) {

            throw new RuntimeException(
                    "Invalid registration role"
            );
        }

        if ("ADMIN".equals(user.getRole())
                && (adminRegistrationKey == null
                || adminRegistrationKey.isBlank()
                || suppliedAdminRegistrationKey == null
                || !MessageDigest.isEqual(
                        adminRegistrationKey.getBytes(StandardCharsets.UTF_8),
                        suppliedAdminRegistrationKey.getBytes(StandardCharsets.UTF_8)
                ))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "A valid admin registration key is required."
            );
        }

        // Check duplicate email
        Optional<User> existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (existingUser.isPresent()) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        System.out.println(
                "Password received successfully"
        );

        // ==========================================
        // ENCODE PASSWORD
        // ==========================================

        String encodedPassword =
                passwordEncoder.encode(
                        user.getPassword()
                );

        System.out.println(
                "Encoded password length: " +
                encodedPassword.length()
        );

        // Set encoded password
        user.setPassword(encodedPassword);

        // ==========================================
        // SAVE USER
        // ==========================================

        User savedUser =
                userRepository.save(user);

        System.out.println(
                "User saved successfully"
        );

        System.out.println(
                "Saved password NULL: " +
                (savedUser.getPassword() == null)
        );

        System.out.println(
                "================================="
        );

        return savedUser;
    }

    // ==========================================
    // LOGIN USER
    // ==========================================

    public User loginUser(
            String email,
            String password) {

        Optional<User> user =
                userRepository.findByEmail(email);

        if (user.isEmpty()) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        User existingUser = user.get();

        if (existingUser.getPassword() == null) {

            throw new RuntimeException(
                    "Account password is missing. Please register again."
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        existingUser.getPassword()
                );

        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return existingUser;
    }
}