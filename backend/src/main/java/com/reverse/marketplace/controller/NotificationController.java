package com.reverse.marketplace.controller;

import com.reverse.marketplace.entity.Notification;
import com.reverse.marketplace.entity.User;
import com.reverse.marketplace.repository.UserRepository;
import com.reverse.marketplace.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository) {

        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    // Get unread notifications
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    // Create a notification
    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestParam Long userId,
            @RequestParam String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                notificationService.createNotification(user, message)
        );
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService.markAsRead(id)
        );
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                "Notification deleted successfully"
        );
    }
}