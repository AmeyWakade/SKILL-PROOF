package com.skillproof.proof.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.catalog.domain.Assessment;
import com.skillproof.catalog.domain.AssessmentRepository;
import com.skillproof.proof.domain.PracticeAttempt;
import com.skillproof.proof.domain.PracticeAnswerReview;
import com.skillproof.proof.domain.PracticeAttemptRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/practice-attempts")
public class PracticeAttemptController {
    private final AppUserRepository users;
    private final AssessmentRepository assessments;
    private final PracticeAttemptRepository attempts;
    public PracticeAttemptController(AppUserRepository users, AssessmentRepository assessments, PracticeAttemptRepository attempts) {
        this.users = users; this.assessments = assessments; this.attempts = attempts;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AttemptResponse> list(Principal principal) {
        return attempts.findAllByUserOrderByCompletedAtDesc(findUser(principal.getName())).stream()
                .map(AttemptResponse::from).toList();
    }

    @PostMapping
    @Transactional
    public AttemptResponse save(@Valid @RequestBody AttemptRequest request, Principal principal) {
        List<AnswerReviewRequest> submittedReviews = request.answerReviews() == null ? List.of() : request.answerReviews();
        if (request.score() > request.totalQuestions()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Score cannot exceed total questions");
        if (!submittedReviews.isEmpty() && submittedReviews.size() != request.totalQuestions())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer review count must match total questions");
        List<PracticeAnswerReview> reviews = submittedReviews.stream()
                .map(answer -> new PracticeAnswerReview(answer.question(), answer.selectedAnswer(), answer.correctAnswer(), answer.explanation()))
                .toList();
        int score = reviews.isEmpty() ? request.score() : (int) reviews.stream().filter(PracticeAnswerReview::isCorrect).count();
        AppUser user = findUser(principal.getName());
        Assessment assessment = assessments.findById(request.assessmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));
        return AttemptResponse.from(attempts.save(new PracticeAttempt(UUID.randomUUID(), user, assessment, score, request.totalQuestions(), reviews)));
    }

    private AppUser findUser(String email) { return users.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElseThrow(); }
    public record AttemptRequest(@NotNull UUID assessmentId, @Min(0) int score, @Min(1) @Max(100) int totalQuestions,
                                 @Size(max = 100) List<@Valid AnswerReviewRequest> answerReviews) { }
    public record AnswerReviewRequest(@NotBlank @Size(max = 600) String question,
                                      @NotBlank @Size(max = 400) String selectedAnswer,
                                      @NotBlank @Size(max = 400) String correctAnswer,
                                      @NotBlank @Size(max = 1000) String explanation) { }
    public record AnswerReviewResponse(String question, String selectedAnswer, String correctAnswer,
                                       String explanation, boolean correct) {
        static AnswerReviewResponse from(PracticeAnswerReview review) {
            return new AnswerReviewResponse(review.getQuestion(), review.getSelectedAnswer(), review.getCorrectAnswer(),
                    review.getExplanation(), review.isCorrect());
        }
    }
    public record AttemptResponse(UUID id, UUID assessmentId, String assessmentTitle, int score, int totalQuestions,
                                  java.time.Instant completedAt, List<AnswerReviewResponse> answerReviews) {
        static AttemptResponse from(PracticeAttempt attempt) {
            return new AttemptResponse(attempt.getId(), attempt.getAssessment().getId(), attempt.getAssessment().getTitle(), attempt.getScore(),
                    attempt.getTotalQuestions(), attempt.getCompletedAt(), attempt.getAnswerReviews().stream().map(AnswerReviewResponse::from).toList());
        }
    }
}
