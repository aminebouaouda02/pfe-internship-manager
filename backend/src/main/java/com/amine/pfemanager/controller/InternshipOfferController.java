package com.amine.pfemanager.controller;

import com.amine.pfemanager.dto.InternshipOfferRequest;
import com.amine.pfemanager.model.InternshipOffer;
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

/**
 * CRUD endpoints for internship offers.
 *
 * <ul>
 *   <li>{@code GET /api/offers[?location=…]} — list, optionally filtered by location</li>
 *   <li>{@code GET /api/offers/{id}} — one offer, 404 if missing</li>
 *   <li>{@code POST /api/offers} — create from an {@link InternshipOfferRequest}, answers 201</li>
 *   <li>{@code PUT /api/offers/{id}} — replace from an {@link InternshipOfferRequest}, 404 if missing</li>
 *   <li>{@code DELETE /api/offers/{id}} — delete, answers 204, 404 if missing</li>
 * </ul>
 *
 * All endpoints require a valid JWT (see {@code SecurityConfig}).
 */
@RestController
@RequestMapping("/api/offers")
public class InternshipOfferController {

    private final InternshipOfferRepository offerRepository;

    public InternshipOfferController(InternshipOfferRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    @GetMapping
    public List<InternshipOffer> listOffers(@RequestParam(required = false) String location) {
        if (location != null && !location.isBlank()) {
            return offerRepository.findByLocationContainingIgnoreCase(location);
        }
        return offerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipOffer> getOffer(@PathVariable Long id) {
        return offerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InternshipOffer> createOffer(@Valid @RequestBody InternshipOfferRequest request) {
        InternshipOffer offer = new InternshipOffer(
                request.getTitle(),
                request.getDescription(),
                request.getCompany(),
                request.getSupervisorName(),
                request.getRequiredSkills(),
                request.getLocation()
        );
        InternshipOffer saved = offerRepository.save(offer);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternshipOffer> updateOffer(@PathVariable Long id,
                                                      @Valid @RequestBody InternshipOfferRequest request) {
        return offerRepository.findById(id)
                .map(offer -> {
                    offer.setTitle(request.getTitle());
                    offer.setDescription(request.getDescription());
                    offer.setCompany(request.getCompany());
                    offer.setSupervisorName(request.getSupervisorName());
                    offer.setRequiredSkills(request.getRequiredSkills());
                    offer.setLocation(request.getLocation());
                    return ResponseEntity.ok(offerRepository.save(offer));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        return offerRepository.findById(id)
                .map(offer -> {
                    offerRepository.delete(offer);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
