package com.reverse.marketplace.repository;

import com.reverse.marketplace.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByRequirementId(Long requirementId);

    List<Offer> findBySellerId(Long sellerId);

    List<Offer> findByStatus(String status);

    @Modifying
    @Query("DELETE FROM Offer o WHERE o.seller.id = :sellerId")
    void deleteOffersBySeller(
            @Param("sellerId") Long sellerId
    );

    @Modifying
    @Query("DELETE FROM Offer o WHERE o.requirement.id = :requirementId")
    void deleteOffersByRequirement(
            @Param("requirementId") Long requirementId
    );
}