package com.skillproof.saved.domain;

import com.skillproof.account.domain.AppUser;
import com.skillproof.catalog.domain.Assessment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saved_assessments", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "assessment_id"}))
public class SavedAssessment {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "assessment_id", nullable = false) private Assessment assessment;
    @Column(nullable = false) private Instant savedAt;
    protected SavedAssessment() { }
    public SavedAssessment(UUID id, AppUser user, Assessment assessment) { this.id=id; this.user=user; this.assessment=assessment; this.savedAt=Instant.now(); }
    public UUID getId() { return id; }
    public Assessment getAssessment() { return assessment; }
    public Instant getSavedAt() { return savedAt; }
}
