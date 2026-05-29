package com.ai.Resume.analyser.model.job;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateJobRequest {
    @NotBlank(message = "title must not be empty")
    private String title;

    @NotBlank(message = "description must not be empty")
    private String description;

    @NotBlank(message = "companyName must not be empty")
    private String companyName;

    @NotBlank(message = "location must not be empty")
    private String location;

    @NotBlank(message = "workMode must not be empty")
    private String workMode;

    @NotBlank(message = "employmentType must not be empty")
    private String employmentType;

    @NotBlank(message = "experienceLevel must not be empty")
    private String experienceLevel;

    @NotBlank(message = "salaryRange must not be empty")
    private String salaryRange;

    @NotBlank(message = "skills must not be empty")
    private String skills;
}

