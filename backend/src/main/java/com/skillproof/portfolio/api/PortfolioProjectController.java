package com.skillproof.portfolio.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.portfolio.domain.PortfolioProject;
import com.skillproof.portfolio.domain.PortfolioProjectRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio-projects")
public class PortfolioProjectController {
    private final AppUserRepository users;
    private final PortfolioProjectRepository projects;
    public PortfolioProjectController(AppUserRepository users, PortfolioProjectRepository projects) { this.users = users; this.projects = projects; }

    @GetMapping public List<ProjectResponse> list(Principal principal) {
        return projects.findAllByUserOrderByCreatedAtDesc(findUser(principal.getName())).stream().map(ProjectResponse::from).toList();
    }

    @PostMapping @Transactional
    public ProjectResponse create(@Valid @RequestBody ProjectRequest request, Principal principal) {
        requireWebUrl(request.projectUrl());
        AppUser user = findUser(principal.getName());
        String skills = request.skills() == null ? "" : request.skills().stream().map(String::trim).filter(s -> !s.isBlank()).distinct().limit(8).collect(java.util.stream.Collectors.joining(", "));
        return ProjectResponse.from(projects.save(new PortfolioProject(UUID.randomUUID(), user, request.title(), request.description(), request.projectUrl(), skills)));
    }

    @DeleteMapping("/{id}") @Transactional @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable UUID id, Principal principal) {
        projects.delete(projects.findByIdAndUser(id, findUser(principal.getName())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found")));
    }

    private void requireWebUrl(String url) {
        try { URI uri = URI.create(url); if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme())) || uri.getHost() == null) throw new IllegalArgumentException(); }
        catch (RuntimeException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project link must be a valid http or https URL"); }
    }
    private AppUser findUser(String email) { return users.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElseThrow(); }
    public record ProjectRequest(@NotBlank @Size(max=100) String title, @NotBlank @Size(max=1000) String description,
                                 @NotBlank @Size(max=500) String projectUrl, List<@Size(max=40) String> skills) { }
    public record ProjectResponse(UUID id, String title, String description, String projectUrl, String skills, java.time.Instant createdAt) {
        static ProjectResponse from(PortfolioProject project) { return new ProjectResponse(project.getId(), project.getTitle(), project.getDescription(), project.getProjectUrl(), project.getSkills(), project.getCreatedAt()); }
    }
}
