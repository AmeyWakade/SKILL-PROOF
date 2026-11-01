package com.skillproof.proof.domain;

import com.skillproof.account.domain.AppUser;
import com.skillproof.catalog.domain.Assessment;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "practice_attempts")
public class PracticeAttempt {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private AppUser user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Assessment assessment;
    private int score;
    private int totalQuestions;
    private Instant completedAt;
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "practice_answer_reviews", joinColumns = @JoinColumn(name = "attempt_id"))
    @OrderColumn(name = "question_order")
    @BatchSize(size = 32)
    private List<PracticeAnswerReview> answerReviews = new ArrayList<>();

    protected PracticeAttempt() { }
    public PracticeAttempt(UUID id, AppUser user, Assessment assessment, int score, int totalQuestions) {
        this(id, user, assessment, score, totalQuestions, List.of());
    }
    public PracticeAttempt(UUID id, AppUser user, Assessment assessment, int score, int totalQuestions,
                           List<PracticeAnswerReview> answerReviews) {
        this.id = id; this.user = user; this.assessment = assessment; this.score = score;
        this.totalQuestions = totalQuestions; this.completedAt = Instant.now();
        this.answerReviews = new ArrayList<>(answerReviews);
    }
    public UUID getId() { return id; }
    public Assessment getAssessment() { return assessment; }
    public int getScore() { return score; }
    public int getTotalQuestions() { return totalQuestions; }
    public Instant getCompletedAt() { return completedAt; }
    public List<PracticeAnswerReview> getAnswerReviews() { return List.copyOf(answerReviews); }
}
