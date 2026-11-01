package com.skillproof.proof.domain;

import com.skillproof.account.domain.AppUser;
import com.skillproof.catalog.domain.Assessment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
class PracticeAttemptRepositoryTest {
    @Autowired private TestEntityManager entityManager;
    @Autowired private PracticeAttemptRepository attempts;
    @Autowired private SessionFactory sessionFactory;

    @Test
    void answerReviewSurvivesDatabaseReloadAndRemainsInQuestionOrder() {
        AppUser user = new AppUser(UUID.randomUUID(), "learner@example.test", "hash", "Learner");
        Assessment assessment = new Assessment(UUID.randomUUID(), "Java basics", "Backend", "Beginner",
                "Practice Java basics", 20, List.of("Java"));
        entityManager.persistAndFlush(user);
        entityManager.persistAndFlush(assessment);
        UUID userId = user.getId();
        UUID assessmentId = assessment.getId();

        PracticeAttempt attempt = new PracticeAttempt(UUID.randomUUID(), user, assessment, 1, 2, List.of(
                new PracticeAnswerReview("Question one", "Right answer", "Right answer", "Why one."),
                new PracticeAnswerReview("Question two", "Wrong answer", "Correct answer", "Why two.")));
        attempts.saveAndFlush(attempt);
        entityManager.clear();

        AppUser reloadedUser = entityManager.find(AppUser.class, userId);
        PracticeAttempt reloaded = attempts.findAllByUserOrderByCompletedAtDesc(reloadedUser).getFirst();

        assertEquals(assessmentId, reloaded.getAssessment().getId());
        assertEquals(2, reloaded.getAnswerReviews().size());
        assertEquals("Question one", reloaded.getAnswerReviews().get(0).getQuestion());
        assertTrue(reloaded.getAnswerReviews().get(0).isCorrect());
        assertFalse(reloaded.getAnswerReviews().get(1).isCorrect());
    }

    @Test
    void historyLoadsAnswerReviewsWithBoundedSelectCount() {
        AppUser user = new AppUser(UUID.randomUUID(), "history@example.test", "hash", "History learner");
        entityManager.persistAndFlush(user);
        for (int index = 0; index < 6; index++) {
            Assessment assessment = new Assessment(UUID.randomUUID(), "Java basics " + index, "Backend", "Beginner",
                    "Practice Java basics", 20, List.of("Java"));
            entityManager.persistAndFlush(assessment);
            attempts.save(new PracticeAttempt(UUID.randomUUID(), user, assessment, 1, 1, List.of(
                    new PracticeAnswerReview("Question " + index, "Right", "Right", "Explanation " + index))));
        }
        attempts.flush();
        entityManager.clear();
        AppUser reloadedUser = entityManager.find(AppUser.class, user.getId());

        var statistics = sessionFactory.getStatistics();
        statistics.clear();
        List<PracticeAttempt> history = attempts.findAllByUserOrderByCompletedAtDesc(reloadedUser);
        int reviewCount = 0;
        for (PracticeAttempt attempt : history) {
            assertTrue(attempt.getAssessment().getTitle().startsWith("Java basics "));
            reviewCount += attempt.getAnswerReviews().size();
        }
        long selectCount = statistics.getPrepareStatementCount();

        assertEquals(6, history.size());
        assertEquals(6, reviewCount);
        assertTrue(selectCount <= 4, "Expected a bounded number of selects, but got " + selectCount);
    }
}
