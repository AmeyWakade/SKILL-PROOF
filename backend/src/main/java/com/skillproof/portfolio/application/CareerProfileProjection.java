package com.skillproof.portfolio.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillproof.account.domain.AppUser;
import com.skillproof.portfolio.domain.PortfolioProject;
import com.skillproof.portfolio.domain.PortfolioProjectRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CareerProfileProjection {
    private final PortfolioProjectRepository projects;

    public CareerProfileProjection(PortfolioProjectRepository projects) { this.projects = projects; }

    public CareerProfileView from(AppUser user) {
        List<PublicProject> visibleProjects = projects.findAllByUserOrderByCreatedAtDesc(user).stream()
                .filter(PortfolioProject::isPublicVisible)
                .map(project -> new PublicProject(project.getId(), project.getTitle(), project.getDescription(),
                        emptyToNull(project.getProjectUrl()), emptyToNull(project.getGithubUrl()),
                        emptyToNull(project.getDemoUrl()), user.isPublicSkillsEnabled() ? emptyToNull(project.getSkills()) : null,
                        project.getStatus(), project.getCreatedAt()))
                .toList();

        boolean showDetails = user.isPublicCareerDetailsEnabled();
        List<String> visibleSkills = user.isPublicSkillsEnabled() && !user.getSkills().isEmpty() ? user.getSkills() : null;
        return new CareerProfileView(user.getId(), user.getDisplayName(),
                showDetails ? emptyToNull(user.getHeadline()) : null,
                showDetails ? emptyToNull(user.getTargetRole()) : null,
                showDetails ? emptyToNull(user.getLocation()) : null,
                showDetails ? emptyToNull(user.getBio()) : null,
                visibleSkills, visibleProjects);
    }

    private static String emptyToNull(String value) { return value == null || value.isBlank() ? null : value; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CareerProfileView(UUID id, String displayName, String headline, String targetRole,
                                    String location, String bio, List<String> skills,
                                    List<PublicProject> projects) { }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record PublicProject(UUID id, String title, String description, String projectUrl,
                                String githubUrl, String demoUrl, String skills,
                                com.skillproof.portfolio.domain.ProjectStatus status, Instant createdAt) { }
}
