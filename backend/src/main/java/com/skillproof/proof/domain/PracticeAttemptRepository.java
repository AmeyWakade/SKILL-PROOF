package com.skillproof.proof.domain;

import com.skillproof.account.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PracticeAttemptRepository extends JpaRepository<PracticeAttempt, UUID> {
    List<PracticeAttempt> findAllByUserOrderByCompletedAtDesc(AppUser user);
}
