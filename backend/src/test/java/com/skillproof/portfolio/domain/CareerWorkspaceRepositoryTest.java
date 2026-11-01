package com.skillproof.portfolio.domain;

import com.skillproof.account.domain.AppUser;
import com.skillproof.portfolio.application.CareerProfileProjection;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CareerWorkspaceRepositoryTest {
    @Autowired private TestEntityManager entityManager;
    @Autowired private PortfolioProjectRepository projects;

    @Test
    void projectStatusAndOptionalLinksPersistAcrossReloadAndUpdate() {
        AppUser user = new AppUser(UUID.randomUUID(), "career@example.test", "hash", "Career learner");
        PortfolioProject legacyProject = new PortfolioProject(UUID.randomUUID(), user, "Existing project", "Existing description",
                "https://example.test/old-project", "Java");
        assertEquals(ProjectStatus.PLANNED, legacyProject.getStatus());
        assertEquals("https://example.test/old-project", legacyProject.getProjectUrl());
        entityManager.persistAndFlush(user);
        PortfolioProject project = new PortfolioProject(UUID.randomUUID(), user, "Study planner", "A planner I am building.",
                "", "https://github.com/example/study-planner", null, "Java, SQL", ProjectStatus.IN_PROGRESS, false);
        projects.saveAndFlush(project);
        UUID projectId = project.getId();
        entityManager.clear();

        PortfolioProject loaded = projects.findById(projectId).orElseThrow();
        assertEquals(ProjectStatus.IN_PROGRESS, loaded.getStatus());
        assertEquals("https://github.com/example/study-planner", loaded.getGithubUrl());
        assertNull(loaded.getDemoUrl());
        assertFalse(loaded.isPublicVisible());

        loaded.update("Study planner", "A planner I am building.", "", null, "https://example.test/demo",
                "Java, SQL", ProjectStatus.COMPLETED, true);
        projects.saveAndFlush(loaded);
        entityManager.clear();
        PortfolioProject updated = projects.findById(projectId).orElseThrow();
        assertEquals(ProjectStatus.COMPLETED, updated.getStatus());
        assertEquals("https://example.test/demo", updated.getDemoUrl());
        assertTrue(updated.isPublicVisible());
    }

    @Test
    void publicProjectionOmitsPrivateCareerDataAndProjectsAndRespectsSeparateSkillsChoice() {
        AppUser user = new AppUser(UUID.randomUUID(), "private@example.test", "NEVER-RETURN-HASH", "Private learner");
        user.updateProfile("Private learner", "Private headline", "Private bio", "Private location", "Private goal",
                List.of("Java"), true, false, false);
        entityManager.persistAndFlush(user);
        projects.saveAndFlush(new PortfolioProject(UUID.randomUUID(), user, "Private project", "Private description", "",
                null, null, "Java", ProjectStatus.COMPLETED, false));
        projects.saveAndFlush(new PortfolioProject(UUID.randomUUID(), user, "Shared project", "Shared description", "",
                "https://github.com/example/shared", null, "Java", ProjectStatus.IN_PROGRESS, true));
        entityManager.flush();

        var view = new CareerProfileProjection(projects).from(user);
        assertEquals("Private learner", view.displayName());
        assertNull(view.headline());
        assertNull(view.targetRole());
        assertNull(view.location());
        assertNull(view.bio());
        assertNull(view.skills());
        assertEquals(1, view.projects().size());
        assertEquals("Shared project", view.projects().getFirst().title());
        assertNull(view.projects().getFirst().skills());
        assertEquals(ProjectStatus.IN_PROGRESS, view.projects().getFirst().status());
        assertFalse(view.toString().contains("NEVER-RETURN-HASH"));
        List<String> responseFields = java.util.Arrays.stream(view.getClass().getRecordComponents())
                .map(java.lang.reflect.RecordComponent::getName).toList();
        assertFalse(responseFields.contains("email"));
        assertFalse(responseFields.contains("passwordHash"));
        assertFalse(responseFields.contains("practiceAttempts"));
    }

    @Test
    void publicDetailsAndSkillsCanBeSharedWithoutMakingProjectsPublic() {
        AppUser user = new AppUser(UUID.randomUUID(), "selected@example.test", "hash", "Selected learner");
        user.updateProfile("Selected learner", "Java learner", "Building my skills", "Pune", "Java developer",
                List.of("Java", "SQL"), true, true, true);
        entityManager.persistAndFlush(user);
        var view = new CareerProfileProjection(projects).from(user);
        assertEquals("Java developer", view.targetRole());
        assertEquals(List.of("Java", "SQL"), view.skills());
        assertTrue(view.projects().isEmpty());
    }
}
