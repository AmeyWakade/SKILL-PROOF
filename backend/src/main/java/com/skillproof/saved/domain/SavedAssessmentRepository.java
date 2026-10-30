package com.skillproof.saved.domain;

import com.skillproof.account.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedAssessmentRepository extends JpaRepository<SavedAssessment, UUID> {
    List<SavedAssessment> findAllByUserOrderBySavedAtDesc(AppUser user);
    Optional<SavedAssessment> findByUserAndAssessment_Id(AppUser user, UUID assessmentId);
}
