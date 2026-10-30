package com.skillproof.compiler.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/compiler")
public class CompilerController {
    private static final Map<String, Language> LANGUAGES = Map.of(
            "java", new Language("java", "5"),
            "python", new Language("python3", "5"),
            "javascript", new Language("nodejs", "7"),
            "cpp", new Language("cpp17", "3"),
            "c", new Language("c", "7")
    );
    private final RestClient http = RestClient.create();
    private final String clientId;
    private final String clientSecret;

    public CompilerController(@Value("${skillproof.compiler.client-id:}") String clientId,
                              @Value("${skillproof.compiler.client-secret:}") String clientSecret) {
        this.clientId = clientId.trim();
        this.clientSecret = clientSecret.trim();
    }

    @GetMapping("/status")
    public Status status() { return new Status(!clientId.isBlank() && !clientSecret.isBlank(), "JDoodle"); }

    @PostMapping("/run")
    public RunResponse run(@Valid @RequestBody RunRequest request) {
        if (clientId.isBlank() || clientSecret.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Code runner is not configured. Set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET on the backend, then restart it.");
        Language language = LANGUAGES.get(request.language());
        if (language == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a supported language.");
        try {
            Map<?, ?> result = http.post().uri("https://api.jdoodle.com/v1/execute")
                    .body(new ProviderRequest(clientId, clientSecret, request.source(), language.id(), language.version(), request.stdin()))
                    .retrieve().body(Map.class);
            if (result == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The compiler returned no result.");
            return new RunResponse(value(result, "output"), value(result, "statusCode"),
                    value(result, "cpuTime"), value(result, "memory"));
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 429)
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "The JDoodle daily execution allowance has been reached. Try again after it resets.");
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The code execution provider could not run this program. Check its API configuration and try again.");
        }
    }

    private String value(Map<?, ?> result, String key) {
        Object value = result.get(key);
        return value == null ? "" : String.valueOf(value);
    }

    public record Status(boolean enabled, String provider) { }
    public record RunRequest(@NotBlank @Pattern(regexp = "java|python|javascript|cpp|c") String language,
                             @NotBlank @Size(max = 12000) String source,
                             @Size(max = 2000) String stdin) { }
    public record RunResponse(String output, String statusCode, String cpuTime, String memory) { }
    private record Language(String id, String version) { }
    private record ProviderRequest(String clientId, String clientSecret, String script, String language,
                                   String versionIndex, String stdin) { }
}
