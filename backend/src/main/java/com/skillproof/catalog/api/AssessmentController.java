package com.skillproof.catalog.api;

import com.skillproof.catalog.application.AssessmentService;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/assessments")
public class AssessmentController {
    private final AssessmentService service;
    public AssessmentController(AssessmentService service) { this.service = service; }
    @GetMapping
    public List<AssessmentResponse> findAll(@RequestParam(required = false) @Size(max = 100) String q,
                                            @RequestParam(required = false) @Size(max = 40) String skill) {
        return service.findAll(q, skill);
    }
    @GetMapping("/{id}")
    public AssessmentResponse findById(@PathVariable UUID id) { return service.findById(id); }

}
