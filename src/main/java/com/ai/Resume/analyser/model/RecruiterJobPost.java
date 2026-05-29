package com.ai.Resume.analyser.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterJobPost {

    @Id
    private String id;

    private String recruiterEmail;

    private String title;

    // Keep it short-ish for MySQL default row sizes; can be bumped later.
    private String description;
    private String companyName;
    private String location;
    private String workMode;
    private String employmentType;
    private String experienceLevel;
    private String salaryRange;
    private String skills;

    @CreationTimestamp
    private Date createdAt;

    @UpdateTimestamp
    private Date updatedAt;
}

