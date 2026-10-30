package com.skillproof.proof.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.proof.domain.PracticeAttempt;
import com.skillproof.proof.domain.PracticeAttemptRepository;
import com.skillproof.portfolio.domain.PortfolioProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public-profiles")
public class PublicProfileController {
    private final AppUserRepository users;
    private final PracticeAttemptRepository attempts;
    private final PortfolioProjectRepository projects;
    public PublicProfileController(AppUserRepository users, PracticeAttemptRepository attempts, PortfolioProjectRepository projects) {
        this.users = users; this.attempts = attempts; this.projects = projects;
    }

    @GetMapping("/{userId}")
    public PublicProfile get(@PathVariable UUID userId) {
        AppUser user = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        if (!user.isPublicProfileEnabled()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This profile is private");
        List<PracticeAttempt> results = attempts.findAllByUserOrderByCompletedAtDesc(user);
        Map<String, List<PracticeAttempt>> byPath = results.stream().collect(Collectors.groupingBy(a -> a.getAssessment().getCategory(), TreeMap::new, Collectors.toList()));
        List<StreamBadge> badges = byPath.entrySet().stream().map(entry -> badge(entry.getKey(), entry.getValue())).toList();
        List<Achievement> achievements = results.stream().map(a -> new Achievement(a.getId(), a.getAssessment().getTitle(),
                a.getAssessment().getCategory(), a.getScore(), a.getTotalQuestions(), a.getCompletedAt())).toList();
        List<Project> portfolio = projects.findAllByUserOrderByCreatedAtDesc(user).stream().map(p -> new Project(p.getId(), p.getTitle(), p.getDescription(), p.getProjectUrl(), p.getSkills(), p.getCreatedAt())).toList();
        return new PublicProfile(user.getId(), user.getDisplayName(), user.getHeadline(), user.getBio(), user.getLocation(),
                user.getTargetRole(), user.getSkills(), badges, achievements, portfolio);
    }

    private StreamBadge badge(String path, List<PracticeAttempt> results) {
        double average = results.stream().mapToInt(a -> Math.round(100f * a.getScore() / a.getTotalQuestions())).average().orElse(0);
        int count = results.size();
        String level = count >= 5 && average >= 85 ? "Focused practice" : count >= 3 ? "Committed learner" : "Getting started";
        String detail = count >= 5 && average >= 85 ? "5+ attempts with an 85%+ average" : count >= 3 ? "3+ practice assessments completed" : "At least one practice assessment completed";
        return new StreamBadge(path, level, detail, count, Math.round(average));
    }

    public record PublicProfile(UUID id, String displayName, String headline, String bio, String location,
                                String targetRole, List<String> skills, List<StreamBadge> badges,
                                List<Achievement> achievements, List<Project> projects) { }
    public record StreamBadge(String path, String level, String detail, int practiceCount, long averageScore) { }
    public record Achievement(UUID id, String title, String path, int score, int totalQuestions, java.time.Instant completedAt) { }
    public record Project(UUID id, String title, String description, String projectUrl, String skills, java.time.Instant createdAt) { }
}
