package com.skillproof.saved.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.catalog.api.AssessmentResponse;
import com.skillproof.catalog.domain.Assessment;
import com.skillproof.catalog.domain.AssessmentRepository;
import com.skillproof.saved.domain.SavedAssessment;
import com.skillproof.saved.domain.SavedAssessmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saved-assessments")
public class SavedAssessmentController {
    private final AppUserRepository users;
    private final AssessmentRepository assessments;
    private final SavedAssessmentRepository saved;
    public SavedAssessmentController(AppUserRepository users, AssessmentRepository assessments, SavedAssessmentRepository saved) {
        this.users=users; this.assessments=assessments; this.saved=saved;
    }
    @GetMapping
    public List<AssessmentResponse> list(Principal principal) {
        AppUser user = findUser(principal.getName());
        return saved.findAllByUserOrderBySavedAtDesc(user).stream().map(item -> AssessmentResponse.from(item.getAssessment())).toList();
    }
    @PostMapping("/{assessmentId}")
    @Transactional
    public AssessmentResponse add(@PathVariable UUID assessmentId, Principal principal) {
        AppUser user = findUser(principal.getName());
        Assessment assessment = assessments.findById(assessmentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));
        saved.findByUserAndAssessment_Id(user, assessmentId).orElseGet(() -> saved.save(new SavedAssessment(UUID.randomUUID(), user, assessment)));
        return AssessmentResponse.from(assessment);
    }
    @DeleteMapping("/{assessmentId}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable UUID assessmentId, Principal principal) {
        AppUser user = findUser(principal.getName());
        saved.findByUserAndAssessment_Id(user, assessmentId).ifPresent(saved::delete);
    }
    private AppUser findUser(String email) { return users.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElseThrow(); }
}
