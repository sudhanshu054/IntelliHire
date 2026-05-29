package com.ai.Resume.analyser.service;

import com.ai.Resume.analyser.model.JobApplication;
import com.ai.Resume.analyser.model.RecruiterJobPost;
import com.ai.Resume.analyser.model.job.ApplicantSummary;
import com.ai.Resume.analyser.model.job.CreateJobRequest;
import com.ai.Resume.analyser.model.job.SeekerApplicationView;
import com.ai.Resume.analyser.model.previousTable;
import com.ai.Resume.analyser.model.usersTable;
import com.ai.Resume.analyser.repository.JobApplicationRepo;
import com.ai.Resume.analyser.repository.RecruiterJobPostRepo;
import com.ai.Resume.analyser.repository.prevTable;
import com.ai.Resume.analyser.repository.usersTableRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class jobService {

    @Autowired
    private usersTableRepo usersTableRepository;

    @Autowired
    private RecruiterJobPostRepo recruiterJobPostRepo;

    @Autowired
    private JobApplicationRepo jobApplicationRepo;

    @Autowired
    private prevTable previousTableRepo;

    private usersTable getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        usersTable user = usersTableRepository.findById(email).orElse(null);
        if (user != null && (user.getRole() == null || user.getRole().trim().isEmpty())) {
            user.setRole("JOB_SEEKER");
            usersTableRepository.save(user);
        }
        return user;
    }

    public ResponseEntity<?> createJob(CreateJobRequest req) {
        usersTable user = getCurrentUser();
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!"RECRUITER".equalsIgnoreCase(user.getRole())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }

        RecruiterJobPost job = RecruiterJobPost.builder()
                .id(UUID.randomUUID().toString())
                .recruiterEmail(user.getEmail())
                .title(req.getTitle().trim())
                .description(req.getDescription().trim())
                .companyName(req.getCompanyName().trim())
                .location(req.getLocation().trim())
                .workMode(req.getWorkMode().trim())
                .employmentType(req.getEmploymentType().trim())
                .experienceLevel(req.getExperienceLevel().trim())
                .salaryRange(req.getSalaryRange().trim())
                .skills(req.getSkills().trim())
                .build();

        recruiterJobPostRepo.save(job);
        return new ResponseEntity<>(job, HttpStatus.CREATED);
    }

    public ResponseEntity<?> listMyJobs() {
        usersTable user = getCurrentUser();
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!"RECRUITER".equalsIgnoreCase(user.getRole())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(recruiterJobPostRepo.findByRecruiterEmailOrderByCreatedAtDesc(user.getEmail()), HttpStatus.OK);
    }

    public ResponseEntity<?> listJobsForSeekers() {
        usersTable user = getCurrentUser();
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!"JOB_SEEKER".equalsIgnoreCase(user.getRole())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }
        // Only return jobs the seeker has NOT applied to.
        List<JobApplication> applied = jobApplicationRepo.findBySeekerEmailOrderByAppliedAtDesc(user.getEmail());
        Set<String> appliedJobIds = new HashSet<>();
        for (JobApplication a : applied) {
            appliedJobIds.add(a.getJobId());
        }
        List<RecruiterJobPost> all = recruiterJobPostRepo.findAllByOrderByCreatedAtDesc();
        List<RecruiterJobPost> available = new ArrayList<>();
        for (RecruiterJobPost j : all) {
            if (!appliedJobIds.contains(j.getId())) {
                available.add(j);
            }
        }
        return new ResponseEntity<>(available, HttpStatus.OK);
    }

    public ResponseEntity<?> listMyApplications() {
        usersTable user = getCurrentUser();
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!"JOB_SEEKER".equalsIgnoreCase(user.getRole())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }
        List<JobApplication> apps = jobApplicationRepo.findBySeekerEmailOrderByAppliedAtDesc(user.getEmail());
        List<SeekerApplicationView> out = new ArrayList<>();
        for (JobApplication a : apps) {
            RecruiterJobPost job = recruiterJobPostRepo.findById(a.getJobId()).orElse(null);
            out.add(new SeekerApplicationView(a.getId(), a.getAppliedAt(), job));
        }
        return new ResponseEntity<>(out, HttpStatus.OK);
    }

    public ResponseEntity<?> applyToJob(String jobId) {
        usersTable user = getCurrentUser();
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!"JOB_SEEKER".equalsIgnoreCase(user.getRole())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }

        RecruiterJobPost job = recruiterJobPostRepo.findById(jobId).orElse(null);
        if (job == null) {
            return new ResponseEntity<>("Job not found", HttpStatus.NOT_FOUND);
        }

        if (jobApplicationRepo.existsByJobIdAndSeekerEmail(jobId, user.getEmail())) {
            return new ResponseEntity<>("Already applied", HttpStatus.CONFLICT);
        }

        JobApplication application = JobApplication.builder()
                .id(UUID.randomUUID().toString())
                .jobId(jobId)
                .recruiterEmail(job.getRecruiterEmail())
                .seekerEmail(user.getEmail())
                .build();
        jobApplicationRepo.save(application);

        return new ResponseEntity<>("Applied successfully", HttpStatus.OK);
    }

    public ResponseEntity<?> listApplicants(String jobId) {
        usersTable user = getCurrentUser();
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (!"RECRUITER".equalsIgnoreCase(user.getRole())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }

        RecruiterJobPost job = recruiterJobPostRepo.findById(jobId).orElse(null);
        if (job == null) {
            return new ResponseEntity<>("Job not found", HttpStatus.NOT_FOUND);
        }
        if (!user.getEmail().equalsIgnoreCase(job.getRecruiterEmail())) {
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
        }

        List<JobApplication> apps = jobApplicationRepo.findByJobIdOrderByAppliedAtDesc(jobId);
        List<ApplicantSummary> out = new ArrayList<>();
        for (JobApplication app : apps) {
            usersTable seeker = usersTableRepository.findById(app.getSeekerEmail()).orElse(null);
            previousTable analysis = previousTableRepo.findById(app.getSeekerEmail()).orElse(null);
            out.add(new ApplicantSummary(
                    app.getSeekerEmail(),
                    seeker != null ? seeker.getUsername() : app.getSeekerEmail(),
                    app.getAppliedAt(),
                    analysis
            ));
        }

        return new ResponseEntity<>(out, HttpStatus.OK);
    }
}

