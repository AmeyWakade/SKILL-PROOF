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
    @Column(length = 500) private String githubUrl;
    @Column(length = 500) private String demoUrl;
    @Column(nullable = false, length = 300) private String skills;
    @jakarta.persistence.Enumerated(EnumType.STRING)
    @Column(length = 20) private ProjectStatus status;
    @Column(name = "public_visible") private Boolean publicVisible = false;
    @Column(nullable = false) private Instant createdAt;
    protected PortfolioProject() { }
    public PortfolioProject(UUID id, AppUser user, String title, String description, String projectUrl, String skills) {
        this(id, user, title, description, projectUrl, null, null, skills, ProjectStatus.PLANNED, false);
    }
    public PortfolioProject(UUID id, AppUser user, String title, String description, String projectUrl,
                            String githubUrl, String demoUrl, String skills, ProjectStatus status, boolean publicVisible) {
        this.id = id; this.user = user; this.title = title.trim(); this.description = description.trim();
        this.projectUrl = projectUrl == null ? "" : projectUrl.trim();
        this.githubUrl = clean(githubUrl); this.demoUrl = clean(demoUrl);
        this.skills = skills == null ? "" : skills.trim();
        this.status = status == null ? ProjectStatus.PLANNED : status;
        this.publicVisible = publicVisible;
        this.createdAt = Instant.now();
    }
    public void update(String title, String description, String projectUrl, String githubUrl, String demoUrl,
                       String skills, ProjectStatus status, boolean publicVisible) {
        this.title = title.trim(); this.description = description.trim();
        this.projectUrl = projectUrl == null ? "" : projectUrl.trim();
        this.githubUrl = clean(githubUrl); this.demoUrl = clean(demoUrl);
        this.skills = skills == null ? "" : skills.trim();
        this.status = status == null ? ProjectStatus.PLANNED : status;
        this.publicVisible = publicVisible;
    }
    private static String clean(String value) { return value == null ? null : value.trim().isEmpty() ? null : value.trim(); }
    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getProjectUrl() { return projectUrl; }
    public String getGithubUrl() { return githubUrl; }
    public String getDemoUrl() { return demoUrl; }
    public String getSkills() { return skills; }
    public ProjectStatus getStatus() { return status == null ? ProjectStatus.PLANNED : status; }
    public boolean isPublicVisible() { return Boolean.TRUE.equals(publicVisible); }
    public Instant getCreatedAt() { return createdAt; }
}
