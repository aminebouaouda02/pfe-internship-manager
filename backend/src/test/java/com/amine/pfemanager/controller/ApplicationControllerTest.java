package com.amine.pfemanager.controller;

import com.amine.pfemanager.dto.ApplicationRequest;
import com.amine.pfemanager.model.Application;
import com.amine.pfemanager.model.InternshipOffer;
import com.amine.pfemanager.repository.ApplicationRepository;
import com.amine.pfemanager.repository.InternshipOfferRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ApplicationController, with both repositories mocked.
 * The key rules under test: an application needs an existing offer,
 * starts as PENDING, and only PENDING / ACCEPTED / REJECTED are valid
 * status changes.
 */
class ApplicationControllerTest {

    private final ApplicationRepository applicationRepository =
            mock(ApplicationRepository.class);
    private final InternshipOfferRepository offerRepository =
            mock(InternshipOfferRepository.class);
    private final ApplicationController controller =
            new ApplicationController(applicationRepository, offerRepository);

    private InternshipOffer sampleOffer() {
        return new InternshipOffer("Data Intern", "Work on data pipelines",
                "Acme", "Sara", "Java, Spark", "Casablanca");
    }

    private ApplicationRequest sampleRequest() {
        ApplicationRequest request = new ApplicationRequest();
        request.setStudentName("Amine");
        request.setStudentEmail("amine@example.com");
        request.setSkills("Java, Spark");
        request.setCoverLetter("I would like this internship.");
        request.setOfferId(1L);
        return request;
    }

    @Test
    void createApplicationStartsPending() {
        when(offerRepository.findById(1L)).thenReturn(Optional.of(sampleOffer()));
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createApplication(sampleRequest());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        Application saved = (Application) response.getBody();
        assertEquals(Application.Status.PENDING, saved.getStatus());
        assertEquals("Amine", saved.getStudentName());
    }

    @Test
    void createApplicationWithMissingOfferReturns404() {
        when(offerRepository.findById(1L)).thenReturn(Optional.empty());

        var response = controller.createApplication(sampleRequest());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateApplicationStatusWithInvalidStatusReturns400() {
        var response = controller.updateApplicationStatus(1L, "WRONG");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateApplicationStatusToAcceptedReturns200() {
        Application application = new Application("Amine", "amine@example.com",
                "Java, Spark", "I would like this internship.", sampleOffer());
        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.updateApplicationStatus(1L, "accepted");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Application.Status.ACCEPTED,
                ((Application) response.getBody()).getStatus());
    }

    @Test
    void getMissingApplicationReturns404() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        var response = controller.getApplication(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
