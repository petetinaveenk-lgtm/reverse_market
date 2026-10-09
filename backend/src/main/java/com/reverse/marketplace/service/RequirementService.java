package com.reverse.marketplace.service;

import com.reverse.marketplace.entity.Requirement;
import com.reverse.marketplace.repository.MessageRepository;
import com.reverse.marketplace.repository.OfferRepository;
import com.reverse.marketplace.repository.RequirementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final OfferRepository offerRepository;
    private final MessageRepository messageRepository;

    public RequirementService(
            RequirementRepository requirementRepository,
            OfferRepository offerRepository,
            MessageRepository messageRepository
    ) {
        this.requirementRepository = requirementRepository;
        this.offerRepository = offerRepository;
        this.messageRepository = messageRepository;
    }

    public Requirement createRequirement(Requirement requirement) {
        if (requirement.getStatus() == null) {
            requirement.setStatus("OPEN");
        }

        return requirementRepository.save(requirement);
    }

    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    public Requirement getRequirementById(Long id) {
        return requirementRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Requirement not found"));
    }

    public List<Requirement> getCustomerRequirements(Long customerId) {
        return requirementRepository.findByCustomerId(customerId);
    }

    public List<Requirement> getOpenRequirements() {
        return requirementRepository.findByStatus("OPEN");
    }

    @Transactional
    public void deleteRequirement(Long id) {
        messageRepository.deleteMessagesByRequirement(id);
        offerRepository.deleteOffersByRequirement(id);
        requirementRepository.deleteById(id);
    }
}