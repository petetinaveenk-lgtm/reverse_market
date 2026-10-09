package com.reverse.marketplace.controller;


import com.reverse.marketplace.entity.Offer;
import com.reverse.marketplace.entity.Requirement;
import com.reverse.marketplace.entity.User;

import com.reverse.marketplace.repository.OfferRepository;
import com.reverse.marketplace.repository.NotificationRepository;
import com.reverse.marketplace.repository.RequirementRepository;
import com.reverse.marketplace.repository.UserRepository;
import com.reverse.marketplace.repository.MessageRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final RequirementRepository requirementRepository;
    private final OfferRepository offerRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;

    public AdminController(
            UserRepository userRepository,
            RequirementRepository requirementRepository,
            OfferRepository offerRepository,
            MessageRepository messageRepository,
            NotificationRepository notificationRepository
    ) {
        this.userRepository = userRepository;
        this.requirementRepository = requirementRepository;
        this.offerRepository = offerRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
    }

    // =========================
    // GET USERS
    // =========================

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // =========================
    // GET REQUIREMENTS
    // =========================

    @GetMapping("/requirements")
    public ResponseEntity<List<Requirement>> getAllRequirements() {
        return ResponseEntity.ok(requirementRepository.findAll());
    }

    // =========================
    // GET OFFERS
    // =========================

    @GetMapping("/offers")
    public ResponseEntity<List<Offer>> getAllOffers() {
        return ResponseEntity.ok(offerRepository.findAll());
    }

    // =========================
    // DELETE USER
    // =========================

    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User authenticatedUser = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated admin account was not found.");
        }

        if (authenticatedUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body("Admin cannot delete their own account.");
        }

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // 1. Find all requirements of this customer
        List<Requirement> requirements =
                requirementRepository.findByCustomerId(id);

        // 2. Delete everything related to those requirements
        for (Requirement requirement : requirements) {

            Long requirementId = requirement.getId();

            // Delete messages
            messageRepository.deleteMessagesByRequirement(
                    requirementId
            );

            // Delete offers
            offerRepository.deleteOffersByRequirement(
                    requirementId
            );
        }

        // 3. Delete customer's requirements
        requirementRepository.deleteRequirementsByCustomer(id);

        // 4. Delete seller offers
        offerRepository.deleteOffersBySeller(id);

        // 5. Delete messages sent by user
        messageRepository.deleteMessagesBySender(id);

        // 6. Delete messages received by user
        messageRepository.deleteMessagesByReceiver(id);

        // 7. Delete notifications for the user
        notificationRepository.deleteNotificationsByUser(id);

        // 8. Force Hibernate to execute previous DELETE statements
        requirementRepository.flush();
        offerRepository.flush();
        messageRepository.flush();
        notificationRepository.flush();

        // 9. Finally delete user
        userRepository.deleteById(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }

    // =========================
    // DELETE REQUIREMENT
    // =========================

    @Transactional
    @DeleteMapping("/requirements/{id}")
    public ResponseEntity<String> deleteRequirement(
            @PathVariable Long id
    ) {

        if (!requirementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        messageRepository.deleteMessagesByRequirement(id);

        offerRepository.deleteOffersByRequirement(id);

        messageRepository.flush();
        offerRepository.flush();

        requirementRepository.deleteById(id);

        return ResponseEntity.ok(
                "Requirement deleted successfully"
        );
    }

    // =========================
    // DELETE OFFER
    // =========================

    @Transactional
    @DeleteMapping("/offers/{id}")
    public ResponseEntity<String> deleteOffer(
            @PathVariable Long id
    ) {

        if (!offerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        offerRepository.deleteById(id);

        return ResponseEntity.ok(
                "Offer deleted successfully"
        );
    }

    // =========================
    // STATISTICS
    // =========================

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {

        long totalUsers = userRepository.count();

        long totalRequirements =
                requirementRepository.count();

        long totalOffers =
                offerRepository.count();

        long totalCustomers =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                "CUSTOMER".equals(user.getRole()))
                        .count();

        long totalSellers =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                "SELLER".equals(user.getRole()))
                        .count();

        return ResponseEntity.ok(
                new AdminStats(
                        totalUsers,
                        totalCustomers,
                        totalSellers,
                        totalRequirements,
                        totalOffers
                )
        );
    }

    // =========================
    // STATS CLASS
    // =========================

    public static class AdminStats {

        public long totalUsers;
        public long totalCustomers;
        public long totalSellers;
        public long totalRequirements;
        public long totalOffers;

        public AdminStats(
                long totalUsers,
                long totalCustomers,
                long totalSellers,
                long totalRequirements,
                long totalOffers
        ) {
            this.totalUsers = totalUsers;
            this.totalCustomers = totalCustomers;
            this.totalSellers = totalSellers;
            this.totalRequirements = totalRequirements;
            this.totalOffers = totalOffers;
        }
    }
}