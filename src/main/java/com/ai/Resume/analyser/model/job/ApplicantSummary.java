package com.ai.Resume.analyser.model.job;

import com.ai.Resume.analyser.model.previousTable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplicantSummary {
    private String seekerEmail;
    private String seekerUsername;
    private Date appliedAt;
    private previousTable lastResumeAnalysis;
}

