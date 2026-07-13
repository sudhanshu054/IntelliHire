package com.ai.Resume.analyser.repository;

import com.ai.Resume.analyser.model.RecruiterJobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruiterJobPostRepo extends JpaRepository<RecruiterJobPost, String> {
    List<RecruiterJobPost> findByRecruiterEmailOrderByCreatedAtDesc(String recruiterEmail);
    List<RecruiterJobPost> findAllByOrderByCreatedAtDesc();
    @Query("""
            select j from RecruiterJobPost j
            where (:search is null or :search = ''
                or lower(j.title) like lower(concat('%', :search, '%'))
                or lower(j.description) like lower(concat('%', :search, '%'))
                or lower(j.skills) like lower(concat('%', :search, '%'))
                or lower(j.companyName) like lower(concat('%', :search, '%'))
                or lower(j.location) like lower(concat('%', :search, '%')))
            and (:experience is null or :experience = '' or lower(j.experienceLevel) like lower(concat('%', :experience, '%')))
            and (:workMode is null or :workMode = '' or lower(j.workMode) like lower(concat('%', :workMode, '%')))
            order by j.createdAt desc
            """)
    List<RecruiterJobPost> searchForSeekers(String search, String experience, String workMode);
    void deleteByRecruiterEmail(String recruiterEmail);
}

