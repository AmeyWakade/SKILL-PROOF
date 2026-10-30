package com.skillproof.portfolio.domain;

import com.skillproof.account.domain.AppUser;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "portfolio_projects")
public class PortfolioProject {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private AppUser user;
    @Column(nullable = false, length = 100) private String title;
    @Column(nullable = false, length = 1000) private String description;
    @Column(nullable = false, length = 500) private String projectUrl;
    @Column(nullable = false, length = 300) private String skills;
    @Column(nullable = false) private Instant createdAt;
    protected PortfolioProject() { }
    public PortfolioProject(UUID id, AppUser user, String title, String description, String projectUrl, String skills) {
        this.id = id; this.user = user; this.title = title.trim(); this.description = description.trim();
        this.projectUrl = projectUrl.trim(); this.skills = skills == null ? "" : skills.trim(); this.createdAt = Instant.now();
    }
    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getProjectUrl() { return projectUrl; }
    public String getSkills() { return skills; }
    public Instant getCreatedAt() { return createdAt; }
}
