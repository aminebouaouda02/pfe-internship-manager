package com.amine.pfemanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload for {@code POST /api/applications}: a student applies to one
 * internship offer. The offer is referenced by id; the application
 * always starts in the {@code PENDING} state.
 */
public class ApplicationRequest {

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

    @NotNull
    private Long offerId;

    public ApplicationRequest() {
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public Long getOfferId() {
        return offerId;
    }

    public void setOfferId(Long offerId) {
        this.offerId = offerId;
    }
}
