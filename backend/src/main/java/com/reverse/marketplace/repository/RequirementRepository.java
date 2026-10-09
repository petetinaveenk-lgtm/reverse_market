package com.reverse.marketplace.repository;

import com.reverse.marketplace.entity.Requirement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequirementRepository
        extends JpaRepository<Requirement, Long> {

    // Get requirements created by a particular customer
    List<Requirement> findByCustomerId(Long customerId);

    // Get requirements by status
    List<Requirement> findByStatus(String status);

    // Delete all requirements belonging to a customer
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Requirement r WHERE r.customer.id = :customerId")
    void deleteRequirementsByCustomer(
            @Param("customerId") Long customerId
    );
}