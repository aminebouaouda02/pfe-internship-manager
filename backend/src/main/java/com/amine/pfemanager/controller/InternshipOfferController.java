package com.amine.pfemanager.controller;

import com.amine.pfemanager.model.InternshipOffer;
import com.amine.pfemanager.repository.InternshipOfferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
