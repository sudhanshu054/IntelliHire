package com.ai.Resume.analyser.model.job;

import com.ai.Resume.analyser.model.RecruiterJobPost;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeekerApplicationView {
    private String applicationId;
    private Date appliedAt;
    private RecruiterJobPost job;
}

