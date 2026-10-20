package com.amine.pfemanager.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    private String studentName;

    @NotBlank
    @Email
    @Size(max = 150)
    private String studentEmail;

    /** Comma-separated skills of the student, used later by the Spark stats job. */
    @Size(max = 500)
    private String skills;

    @Size(max = 2000)
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    private InternshipOffer offer;

    private LocalDateTime appliedAt;

    public Application() {
        this.appliedAt = LocalDateTime.now();
    }

    public Application(String studentName, String studentEmail, String skills,
                       String coverLetter, InternshipOffer offer) {
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.skills = skills;
        this.coverLetter = coverLetter;
        this.offer = offer;
        this.status = Status.PENDING;
        this.appliedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public InternshipOffer getOffer() { return offer; }
    public void setOffer(InternshipOffer offer) { this.offer = offer; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
