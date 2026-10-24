package com.amine.pfemanager.controller;

import com.amine.pfemanager.dto.ApplicationRequest;
import com.amine.pfemanager.model.Application;
import com.amine.pfemanager.model.InternshipOffer;
import com.amine.pfemanager.repository.ApplicationRepository;
import com.amine.pfemanager.repository.InternshipOfferRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Endpoints for student applications to internship offers.
 *
 * <ul>
 *   <li>{@code GET /api/applications[?offerId=…][?status=…]} — list,
 *       optionally filtered by offer or by status</li>
 *   <li>{@code GET /api/applications/{id}} — one application, 404 if missing</li>
 *   <li>{@code POST /api/applications} — a student applies to an offer:
 *       the offer must exist and the application starts as PENDING</li>
 *   <li>{@code PUT /api/applications/{id}/status?status=…} — change the status
 *       (PENDING, ACCEPTED, REJECTED)</li>
 *   <li>{@code DELETE /api/applications/{id}} — delete, answers 204, 404 if missing</li>
 * </ul>
 *
 * All endpoints require a valid JWT (see {@code SecurityConfig}).
 */
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final InternshipOfferRepository offerRepository;

    public ApplicationController(ApplicationRepository applicationRepository,
                                InternshipOfferRepository offerRepository) {
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
    }

    @GetMapping
    public List<Application> listApplications(
            @RequestParam(required = false) Long offerId,
            @RequestParam(required = false) String status) {
        if (offerId != null) {
            return applicationRepository.findByOfferId(offerId);
        }
        if (status != null && !status.isBlank()) {
            try {
                return applicationRepository.findByStatus(Application.Status.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }
        return applicationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplication(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createApplication(@Valid @RequestBody ApplicationRequest request) {
        InternshipOffer offer = offerRepository.findById(request.getOfferId()).orElse(null);
        if (offer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Offer not found: " + request.getOfferId()));
        }
        Application application = new Application(
                request.getStudentName(),
                request.getStudentEmail(),
                request.getSkills(),
                request.getCoverLetter(),
                offer
        );
        Application saved = applicationRepository.save(application);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id,
                                                     @RequestParam String status) {
        Application.Status newStatus;
        try {
            newStatus = Application.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status. Use one of: PENDING, ACCEPTED, REJECTED"));
        }
        return applicationRepository.findById(id)
                .map(application -> {
                    application.setStatus(newStatus);
                    return ResponseEntity.ok(applicationRepository.save(application));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(application -> {
                    applicationRepository.delete(application);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
