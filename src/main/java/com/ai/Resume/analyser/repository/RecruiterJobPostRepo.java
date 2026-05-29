package com.ai.Resume.analyser.repository;

import com.ai.Resume.analyser.model.RecruiterJobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruiterJobPostRepo extends JpaRepository<RecruiterJobPost, String> {
    List<RecruiterJobPost> findByRecruiterEmailOrderByCreatedAtDesc(String recruiterEmail);
    List<RecruiterJobPost> findAllByOrderByCreatedAtDesc();
    void deleteByRecruiterEmail(String recruiterEmail);
}

