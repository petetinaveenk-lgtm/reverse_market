package com.reverse.marketplace.service;

import com.reverse.marketplace.entity.Offer;
import com.reverse.marketplace.entity.Requirement;
import com.reverse.marketplace.entity.User;
import com.reverse.marketplace.repository.OfferRepository;
import com.reverse.marketplace.repository.RequirementRepository;
import com.reverse.marketplace.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final RequirementRepository requirementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public OfferService(
            OfferRepository offerRepository,
            RequirementRepository requirementRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.offerRepository = offerRepository;
        this.requirementRepository = requirementRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Create a new offer
    @Transactional
    public Offer createOffer(Offer offer) {
        if (offer == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Offer request is required"
            );
        }

        if (offer.getSeller() == null || offer.getSeller().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seller ID is required"
            );
        }

        if (offer.getRequirement() == null
                || offer.getRequirement().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Requirement ID is required"
            );
        }

        User seller = userRepository.findById(offer.getSeller().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Seller not found"
                ));

        Requirement requirement =
                requirementRepository.findById(offer.getRequirement().getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Requirement not found"
                        ));

        offer.setSeller(seller);
        offer.setRequirement(requirement);

        if (offer.getStatus() == null) {
            offer.setStatus("PENDING");
        }

        Offer savedOffer = offerRepository.save(offer);

        if (savedOffer.getRequirement() != null
                && savedOffer.getRequirement().getCustomer() != null) {
            notificationService.createNotification(
                    savedOffer.getRequirement().getCustomer(),
                    "A seller has submitted a new offer for your requirement: "
                            + savedOffer.getRequirement().getTitle()
            );
        }

        return savedOffer;
    }

    // Get all offers
    public List<Offer> getAllOffers() {
        return offerRepository.findAll();
    }

    // Get offer by ID
    public Offer getOfferById(Long id) {

        return offerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Offer not found"));
    }

    // Get offers for a requirement
    public List<Offer> getRequirementOffers(Long requirementId) {

        return offerRepository.findByRequirementId(requirementId);
    }

    // Get seller's offers
    public List<Offer> getSellerOffers(Long sellerId) {

        return offerRepository.findBySellerId(sellerId);
    }

    // Get pending offers
    public List<Offer> getPendingOffers() {

        return offerRepository.findByStatus("PENDING");
    }

    // Delete offer
    public void deleteOffer(Long id) {

        offerRepository.deleteById(id);
    }

    // Select an offer
    @Transactional
    public Offer selectOffer(Long offerId) {

        Offer selectedOffer = offerRepository.findById(offerId)
                .orElseThrow(() ->
                        new RuntimeException("Offer not found"));

        List<Offer> offers =
                offerRepository.findByRequirementId(
                        selectedOffer.getRequirement().getId()
                );

        for (Offer offer : offers) {

            if (offer.getId().equals(offerId)) {

                offer.setStatus("ACCEPTED");

            } else {

                offer.setStatus("REJECTED");
            }

            offerRepository.save(offer);
        }

        selectedOffer.setStatus("ACCEPTED");

        // Notify the seller that their offer was accepted
        if (selectedOffer.getSeller() != null
                && selectedOffer.getRequirement() != null) {

            notificationService.createNotification(
                    selectedOffer.getSeller(),
                    "Your offer has been accepted for requirement: "
                            + selectedOffer.getRequirement().getTitle()
            );
        }

        return selectedOffer;
    }
}