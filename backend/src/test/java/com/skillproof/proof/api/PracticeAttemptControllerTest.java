package com.skillproof.proof.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.catalog.domain.Assessment;
import com.skillproof.catalog.domain.AssessmentRepository;
import com.skillproof.proof.domain.PracticeAttempt;
import com.skillproof.proof.domain.PracticeAttemptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
class PracticeAttemptControllerTest {
    private final UUID assessmentId = UUID.randomUUID();
    private final AppUser user = new AppUser(UUID.randomUUID(), "learner@example.test", "hash", "Learner");
    private final Assessment assessment = new Assessment(assessmentId, "Java basics", "Backend", "Beginner",
            "Practice Java basics", 20, List.of("Java"));
    private final Principal principal = () -> "learner@example.test";
    private PracticeAttemptController controller;
    private AtomicReference<PracticeAttempt> savedAttempt;

    @BeforeEach
    void setUp() {
        AppUserRepository users = proxy(AppUserRepository.class, (method, args) ->
                method.equals("findByEmail") ? Optional.of(user) : null);
        AssessmentRepository assessments = proxy(AssessmentRepository.class, (method, args) ->
                method.equals("findById") ? Optional.of(assessment) : null);
        savedAttempt = new AtomicReference<>();
        PracticeAttemptRepository attempts = proxy(PracticeAttemptRepository.class, (method, args) -> {
            if (method.equals("save")) { savedAttempt.set((PracticeAttempt) args[0]); return args[0]; }
            return null;
        });
        controller = new PracticeAttemptController(users, assessments, attempts);
    }

    @Test
    void savesQuestionReviewAndDerivesTheStoredScoreFromItsAnswers() {
        var reviews = List.of(
                new PracticeAttemptController.AnswerReviewRequest("What is a Set?", "Unique values", "Unique values", "A Set stores unique values."),
                new PracticeAttemptController.AnswerReviewRequest("What is a Map?", "A sequence", "Key-value pairs", "A Map stores key-value pairs."));

        var response = controller.save(new PracticeAttemptController.AttemptRequest(assessmentId, 0, 2, reviews), principal);

        assertEquals(1, response.score());
        assertEquals(2, response.totalQuestions());
        assertEquals(2, response.answerReviews().size());
        assertTrue(response.answerReviews().get(0).correct());
        assertFalse(response.answerReviews().get(1).correct());
        assertEquals("Key-value pairs", response.answerReviews().get(1).correctAnswer());
        assertEquals(1, savedAttempt.get().getScore());
    }

    @Test
    void rejectsReviewWhoseLengthDoesNotMatchTheAttempt() {
        var review = new PracticeAttemptController.AnswerReviewRequest("Question", "A", "A", "Explanation");
        var exception = assertThrows(ResponseStatusException.class, () -> controller.save(
                new PracticeAttemptController.AttemptRequest(assessmentId, 1, 2, List.of(review)), principal));

        assertEquals(400, exception.getStatusCode().value());
    }

    @SuppressWarnings("unchecked")
    private static <T> T proxy(Class<T> type, RepositoryCall handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, (proxy, method, args) -> {
            if (method.getDeclaringClass() == Object.class) return method.invoke(handler, args);
            return handler.invoke(method.getName(), args);
        });
    }

    @FunctionalInterface
    private interface RepositoryCall {
        Object invoke(String method, Object[] arguments);
    }
}
