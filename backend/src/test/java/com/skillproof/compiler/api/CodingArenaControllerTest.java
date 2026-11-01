package com.skillproof.compiler.api;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CodingArenaControllerTest {
    @Test
    void runsAllServerSideCasesAndReturnsOnlySummary() {
        List<CompilerController.RunRequest> requests = new ArrayList<>();
        CodingArenaController controller = new CodingArenaController(request -> {
            requests.add(request);
            String expected = request.stdin().startsWith("5\n4 2 8") ? "6\n" : "0\n";
            return new CompilerController.RunResponse(expected, "200", "0.01", "1024");
        });

        CodingArenaController.SubmissionResponse result = controller.submit("max-rise",
                new CodingArenaController.SubmissionRequest("public class Main {}"));

        assertEquals(2, result.passed());
        assertEquals(2, result.total());
        assertTrue(result.accepted());
        assertFalse(result.message().contains("4 2 8"));
        assertEquals(2, requests.size());
        assertTrue(requests.stream().allMatch(request -> request.language().equals("java")));
    }

    @Test
    void failedHiddenCaseDoesNotReturnItsInputOrExpectedOutput() {
        CodingArenaController controller = new CodingArenaController(request ->
                new CompilerController.RunResponse("wrong\n", "200", "0.01", "1024"));

        CodingArenaController.SubmissionResponse result = controller.submit("max-rise",
                new CodingArenaController.SubmissionRequest("public class Main {}"));

        assertEquals(0, result.passed());
        assertFalse(result.accepted());
        assertFalse(result.message().contains("6"));
    }

    @Test
    void rejectsUnknownProblemIds() {
        CodingArenaController controller = new CodingArenaController(request -> {
            fail("Unknown problem must not invoke the runner");
            return null;
        });
        assertThrows(ResponseStatusException.class, () -> controller.submit("not-a-problem",
                new CodingArenaController.SubmissionRequest("public class Main {}")));
    }
}
