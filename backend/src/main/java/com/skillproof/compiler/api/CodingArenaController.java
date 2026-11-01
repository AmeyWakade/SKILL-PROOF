package com.skillproof.compiler.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/** Server-side tests stay out of the browser response. User Java code runs only through JDoodle. */
@RestController
@RequestMapping("/api/v1/coding-arena")
public class CodingArenaController {
    private final Runner runner;

    public CodingArenaController(CompilerController compiler) {
        this(request -> compiler.run(new CompilerController.RunRequest("java", request.source(), request.stdin())));
    }

    CodingArenaController(Runner runner) { this.runner = runner; }

    private static final Map<String, List<TestCase>> HIDDEN_TESTS = Map.ofEntries(
            Map.entry("max-rise", List.of(test("5\n4 2 8 1 3\n", "6"), test("3\n5 5 5\n", "0"))),
            Map.entry("clean-palindrome", List.of(test("No lemon, no melon!\n", "true"), test("SkillProof 21\n", "false"))),
            Map.entry("first-unique", List.of(test("teeter\n", "5"), test("zzxyyx\n", "-1"))),
            Map.entry("sort-numbers", List.of(test("6\n3 0 -4 3 12 1\n", "-4 0 1 3 3 12"), test("3\n2 2 2\n", "2 2 2"))),
            Map.entry("first-search", List.of(test("6\n-3 0 4 4 4 9\n4\n", "2"), test("2\n2 8\n1\n", "-1"))),
            Map.entry("balanced-delimiters", List.of(test("{[()]}\n", "true"), test("[(])\n", "false"))),
            Map.entry("queue-survivor", List.of(test("6 2\n", "5"), test("8 3\n", "7"))),
            Map.entry("digit-sum-recursive", List.of(test("90817\n", "25"), test("1000000000\n", "1"))),
            Map.entry("reverse-linked-list", List.of(test("5\n0 -2 8 8 3\n", "3 8 8 -2 0"), test("0\n", ""))),
            Map.entry("tree-height", List.of(test("4 2 6 1 3\n", "3"), test("9 5 # 2\n", "3"))),
            Map.entry("graph-distance", List.of(test("4 3\n0 1\n1 2\n2 3\n0 3\n", "3"), test("4 2\n0 1\n2 3\n0 3\n", "-1"))),
            Map.entry("min-stair-cost", List.of(test("6\n5 1 2 10 2 1\n", "4"), test("3\n8 3 9\n", "3")))
    );

    @PostMapping("/{problemId}/submit")
    public SubmissionResponse submit(@PathVariable String problemId, @Valid @RequestBody SubmissionRequest request) {
        List<TestCase> cases = HIDDEN_TESTS.get(problemId);
        if (cases == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Coding problem not found");
        int passed = 0;
        for (TestCase test : cases) {
            CompilerController.RunResponse result = runner.run(new CompilerController.RunRequest("java", request.source(), test.input()));
            if (result != null && normalize(result.output()).equals(normalize(test.expectedOutput()))) passed++;
        }
        boolean accepted = passed == cases.size();
        return new SubmissionResponse(passed, cases.size(), accepted,
                accepted ? "All hidden tests passed." : "Some hidden tests did not pass. Review your approach and try again.");
    }

    private static TestCase test(String input, String output) { return new TestCase(input, output); }
    private static String normalize(String output) { return output == null ? "" : output.trim().replace("\r\n", "\n"); }

    @FunctionalInterface
    interface Runner { CompilerController.RunResponse run(CompilerController.RunRequest request); }

    public record SubmissionRequest(@NotBlank @Size(max = 12000) String source) { }
    public record SubmissionResponse(int passed, int total, boolean accepted, String message) { }
    private record TestCase(String input, String expectedOutput) { }
}
