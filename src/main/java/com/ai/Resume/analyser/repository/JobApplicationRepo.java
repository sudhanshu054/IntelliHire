package com.ai.Resume.analyser.repository;

import com.ai.Resume.analyser.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepo extends JpaRepository<JobApplication, String> {
    boolean existsByJobIdAndSeekerEmail(String jobId, String seekerEmail);
    List<JobApplication> findByJobIdOrderByAppliedAtDesc(String jobId);
    List<JobApplication> findByRecruiterEmailOrderByAppliedAtDesc(String recruiterEmail);
    List<JobApplication> findBySeekerEmailOrderByAppliedAtDesc(String seekerEmail);
    void deleteByRecruiterEmail(String recruiterEmail);
    void deleteBySeekerEmail(String seekerEmail);
}

