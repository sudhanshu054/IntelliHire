package com.ai.Resume.analyser.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobApplication {

    @Id
    private String id;

    private String jobId;

    private String recruiterEmail;

    private String seekerEmail;

    @CreationTimestamp
    private Date appliedAt;
}

