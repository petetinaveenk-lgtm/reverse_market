package com.reverse.marketplace.service;

import com.reverse.marketplace.entity.Notification;
import com.reverse.marketplace.entity.User;
import com.reverse.marketplace.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Create a notification
    public Notification createNotification(User user, String message) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // Get all notifications for a user
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get unread notifications
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    // Mark notification as read
    public Notification markAsRead(Long notificationId) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    // Delete notification
    public void deleteNotification(Long notificationId) {

        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }

        notificationRepository.deleteById(notificationId);
    }
}