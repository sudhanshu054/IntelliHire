package com.ai.Resume.analyser.controller;

import com.ai.Resume.analyser.model.job.CreateJobRequest;
import com.ai.Resume.analyser.service.jobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("resumeAnalyserCore/service/v1")
@CrossOrigin( origins = "http://localhost:5173" , allowCredentials = "true", allowedHeaders = "*" ,
        methods = {RequestMethod.GET,RequestMethod.POST,RequestMethod.DELETE,RequestMethod.PUT,RequestMethod.OPTIONS,RequestMethod.HEAD})
public class jobController {

    @Autowired
    private jobService jobService;

    @PostMapping("/recruiter/jobs")
    public ResponseEntity<?> createJob(@Valid @RequestBody CreateJobRequest req){
        return jobService.createJob(req);
    }

    @GetMapping("/recruiter/jobs")
    public ResponseEntity<?> listMyJobs(){
        return jobService.listMyJobs();
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> listJobsForSeekers(){
        return jobService.listJobsForSeekers();
    }

    @GetMapping("/jobs/applied")
    public ResponseEntity<?> listMyApplications(){
        return jobService.listMyApplications();
    }

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<?> applyToJob(@PathVariable String jobId){
        return jobService.applyToJob(jobId);
    }

    @GetMapping("/recruiter/jobs/{jobId}/applications")
    public ResponseEntity<?> listApplicants(@PathVariable String jobId){
        return jobService.listApplicants(jobId);
    }
}

