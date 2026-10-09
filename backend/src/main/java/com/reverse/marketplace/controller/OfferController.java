package com.reverse.marketplace.controller;

import com.reverse.marketplace.entity.Offer;
import com.reverse.marketplace.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    public ResponseEntity<Offer> createOffer(
            @RequestBody Offer offer) {

        return ResponseEntity.ok(
                offerService.createOffer(offer)
        );
    }

    @GetMapping
    public ResponseEntity<List<Offer>> getAllOffers() {
        return ResponseEntity.ok(
                offerService.getAllOffers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Offer> getOfferById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                offerService.getOfferById(id)
        );
    }

    @GetMapping("/requirement/{requirementId}")
    public ResponseEntity<List<Offer>> getRequirementOffers(
            @PathVariable Long requirementId) {

        return ResponseEntity.ok(
                offerService.getRequirementOffers(requirementId)
        );
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Offer>> getSellerOffers(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                offerService.getSellerOffers(sellerId)
        );
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Offer>> getPendingOffers() {
        return ResponseEntity.ok(
                offerService.getPendingOffers()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOffer(
            @PathVariable Long id) {

        offerService.deleteOffer(id);

        return ResponseEntity.ok("Offer deleted successfully");
    }
    @PutMapping("/{id}/select")
public ResponseEntity<Offer> selectOffer(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            offerService.selectOffer(id)
    );
}
}