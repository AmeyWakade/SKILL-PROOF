package com.skillproof.portfolio.domain;

import com.skillproof.account.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioProjectRepository extends JpaRepository<PortfolioProject, UUID> {
    List<PortfolioProject> findAllByUserOrderByCreatedAtDesc(AppUser user);
    Optional<PortfolioProject> findByIdAndUser(UUID id, AppUser user);
}
