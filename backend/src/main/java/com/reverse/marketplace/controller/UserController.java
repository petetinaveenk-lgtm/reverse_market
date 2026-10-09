package com.reverse.marketplace.controller;

import com.reverse.marketplace.entity.User;
import com.reverse.marketplace.security.JwtService;
import com.reverse.marketplace.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(
            UserService userService,
            JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }

    // ==========================================
    // REGISTER
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        System.out.println("=================================");
        System.out.println("REGISTRATION REQUEST RECEIVED");
        System.out.println("Name: " + request.name);
        System.out.println("Email: " + request.email);
        System.out.println("Role: " + request.role);
        System.out.println(
                "Password received: " +
                (request.password != null)
        );
        System.out.println("=================================");

        User user = new User();

        user.setName(request.name);
        user.setEmail(request.email);
        user.setPassword(request.password);
        user.setRole(request.role);

        User savedUser;
        try {
            savedUser = userService.registerUser(
                    user,
                    request.adminRegistrationKey
            );
        } catch (ResponseStatusException exception) {
            return ResponseEntity.status(exception.getStatusCode())
                    .body(exception.getReason());
        }

        return ResponseEntity.ok(savedUser);
    }

    // ==========================================
    // LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        User user = userService.loginUser(
                request.email,
                request.password
        );

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        LoginResponse response =
                new LoginResponse(
                        token,
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                );

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // REGISTER REQUEST
    // ==========================================

    public static class RegisterRequest {

        public String name;
        public String email;
        public String password;
        public String role;
        public String adminRegistrationKey;
    }

    // ==========================================
    // LOGIN REQUEST
    // ==========================================

    public static class LoginRequest {

        public String email;
        public String password;
    }

    // ==========================================
    // LOGIN RESPONSE
    // ==========================================

    public static class LoginResponse {

        public String token;
        public Long id;
        public String name;
        public String email;
        public String role;

        public LoginResponse(
                String token,
                Long id,
                String name,
                String email,
                String role) {

            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }
}