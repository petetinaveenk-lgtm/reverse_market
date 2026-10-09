package com.reverse.marketplace.controller;

import com.reverse.marketplace.entity.Requirement;
import com.reverse.marketplace.service.RequirementService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
@CrossOrigin(origins = "*")
public class RequirementController {

    private final RequirementService requirementService;

    public RequirementController(RequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @PostMapping
    public ResponseEntity<Void> createRequirement(
            @RequestBody Requirement requirement) {

        requirementService.createRequirement(requirement);

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Requirement>> getAllRequirements() {
        return ResponseEntity.ok(
                requirementService.getAllRequirements()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Requirement> getRequirementById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                requirementService.getRequirementById(id)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Requirement>> getCustomerRequirements(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                requirementService.getCustomerRequirements(customerId)
        );
    }

    @GetMapping("/open")
    public ResponseEntity<List<Requirement>> getOpenRequirements() {
        return ResponseEntity.ok(
                requirementService.getOpenRequirements()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequirement(
            @PathVariable Long id) {

        requirementService.deleteRequirement(id);

        return ResponseEntity.ok(
                "Requirement deleted successfully"
        );
    }
}