package com.amine.pfemanager.controller;

import com.amine.pfemanager.dto.InternshipOfferRequest;
import com.amine.pfemanager.model.InternshipOffer;
import com.amine.pfemanager.repository.InternshipOfferRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for InternshipOfferController, with the repository mocked.
 * No database is needed: the controller logic (status codes, filters,
 * 404 handling) is what is being checked here.
 */
class InternshipOfferControllerTest {

    private final InternshipOfferRepository offerRepository =
            mock(InternshipOfferRepository.class);
    private final InternshipOfferController controller =
            new InternshipOfferController(offerRepository);

    private InternshipOffer sampleOffer() {
        return new InternshipOffer("Data Intern", "Work on data pipelines",
                "Acme", "Sara", "Java, Spark", "Casablanca");
    }

    private InternshipOfferRequest sampleRequest() {
        InternshipOfferRequest request = new InternshipOfferRequest();
        request.setTitle("Data Intern");
        request.setDescription("Work on data pipelines");
        request.setCompany("Acme");
        request.setSupervisorName("Sara");
        request.setRequiredSkills("Java, Spark");
        request.setLocation("Casablanca");
        return request;
    }

    @Test
    void createOfferReturns201WithSavedOffer() {
        when(offerRepository.save(any(InternshipOffer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createOffer(sampleRequest());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Data Intern", response.getBody().getTitle());
        assertEquals("Casablanca", response.getBody().getLocation());
    }

    @Test
    void getMissingOfferReturns404() {
        when(offerRepository.findById(99L)).thenReturn(Optional.empty());

        var response = controller.getOffer(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void listOffersFiltersByLocation() {
        InternshipOffer offer = sampleOffer();
        when(offerRepository.findByLocationContainingIgnoreCase("Casablanca"))
                .thenReturn(List.of(offer));

        List<InternshipOffer> result = controller.listOffers("Casablanca");

        assertEquals(1, result.size());
        verify(offerRepository).findByLocationContainingIgnoreCase("Casablanca");
    }

    @Test
    void updateMissingOfferReturns404() {
        when(offerRepository.findById(99L)).thenReturn(Optional.empty());

        var response = controller.updateOffer(99L, sampleRequest());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteExistingOfferReturns204() {
        InternshipOffer offer = sampleOffer();
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));

        var response = controller.deleteOffer(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(offerRepository).delete(offer);
    }
}
