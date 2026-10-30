package com.skillproof.proof.domain;

import com.skillproof.account.domain.AppUser;
import com.skillproof.catalog.domain.Assessment;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "practice_attempts")
public class PracticeAttempt {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private AppUser user;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) private Assessment assessment;
    private int score;
    private int totalQuestions;
    private Instant completedAt;

    protected PracticeAttempt() { }
    public PracticeAttempt(UUID id, AppUser user, Assessment assessment, int score, int totalQuestions) {
        this.id = id; this.user = user; this.assessment = assessment; this.score = score;
        this.totalQuestions = totalQuestions; this.completedAt = Instant.now();
    }
    public UUID getId() { return id; }
    public Assessment getAssessment() { return assessment; }
    public int getScore() { return score; }
    public int getTotalQuestions() { return totalQuestions; }
    public Instant getCompletedAt() { return completedAt; }
}
