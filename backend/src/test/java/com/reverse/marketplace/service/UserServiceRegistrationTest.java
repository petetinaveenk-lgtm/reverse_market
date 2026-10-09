package com.reverse.marketplace.service;

import com.reverse.marketplace.entity.User;
import com.reverse.marketplace.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceRegistrationTest {

    private static final String CONFIGURED_ADMIN_KEY = "configured-admin-key";

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        userService = new UserService(
                userRepository,
                passwordEncoder,
                CONFIGURED_ADMIN_KEY
        );

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString()))
                .thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void customerCanRegisterWithoutAdminKey() {
        assertRegistered("CUSTOMER", null);
    }

    @Test
    void sellerCanRegisterWithoutAdminKey() {
        assertRegistered("SELLER", null);
    }

    @Test
    void adminWithoutKeyIsForbidden() {
        assertAdminRegistrationForbidden(null);
    }

    @Test
    void adminWithIncorrectKeyIsForbidden() {
        assertAdminRegistrationForbidden("incorrect-key");
    }

    @Test
    void adminWithConfiguredKeyCanRegister() {
        assertRegistered("ADMIN", CONFIGURED_ADMIN_KEY);
    }

    private void assertAdminRegistrationForbidden(String suppliedKey) {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> userService.registerUser(newUser("ADMIN"), suppliedKey)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    private void assertRegistered(String role, String suppliedKey) {
        User user = newUser(role);

        User savedUser = userService.registerUser(user, suppliedKey);

        assertEquals(role, savedUser.getRole());
        assertEquals("encoded-password", savedUser.getPassword());
        verify(userRepository).save(user);
    }

    private User newUser(String role) {
        User user = new User();
        user.setName("Registration Test");
        user.setEmail(role.toLowerCase() + "@registration-test.invalid");
        user.setPassword("registration-test-password");
        user.setRole(role);
        return user;
    }
}
