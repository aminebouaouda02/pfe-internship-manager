package com.amine.pfemanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload for creating or updating an internship offer
 * ({@code POST /api/offers}, {@code PUT /api/offers/{id}}).
 * The rules below are checked automatically because the controller
 * receives this object with {@code @Valid}: invalid input gets a
 * 400 Bad Request response without any extra code.
 */
public class InternshipOfferRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotBlank
    @Size(max = 120)
    private String company;

    @Size(max = 120)
    private String supervisorName;

    /** Comma-separated skills, e.g. "Java,Spring Boot,React". */
    @Size(max = 500)
    private String requiredSkills;

    @Size(max = 100)
    private String location;

    public InternshipOfferRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getSupervisorName() {
        return supervisorName;
    }

    public void setSupervisorName(String supervisorName) {
        this.supervisorName = supervisorName;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
