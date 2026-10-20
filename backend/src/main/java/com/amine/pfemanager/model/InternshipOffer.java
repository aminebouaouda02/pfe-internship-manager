package com.amine.pfemanager.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "internship_offers")
public class InternshipOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @NotBlank
    @Size(max = 120)
    private String company;

    @Size(max = 120)
    private String supervisorName;

    /** Comma-separated skills, e.g. "Java,Spring Boot,React" — kept simple for Day 1. */
    @Size(max = 500)
    private String requiredSkills;

    @Size(max = 100)
    private String location;

    private LocalDateTime createdAt;

    public InternshipOffer() {
        this.createdAt = LocalDateTime.now();
    }

    public InternshipOffer(String title, String description, String company,
                           String supervisorName, String requiredSkills, String location) {
        this.title = title;
        this.description = description;
        this.company = company;
        this.supervisorName = supervisorName;
        this.requiredSkills = requiredSkills;
        this.location = location;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getSupervisorName() { return supervisorName; }
    public void setSupervisorName(String supervisorName) { this.supervisorName = supervisorName; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
