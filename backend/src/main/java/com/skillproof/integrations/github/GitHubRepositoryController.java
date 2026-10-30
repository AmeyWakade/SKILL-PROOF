package com.skillproof.integrations.github;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/integrations/github")
public class GitHubRepositoryController {
    private final RestClient http = RestClient.create();

    @GetMapping("/repository")
    public RepositoryPreview importRepository(@RequestParam String url) {
        String[] parts = parseRepository(url);
        try {
            GitHubRepository repo = http.get()
                    .uri("https://api.github.com/repos/{owner}/{repo}", parts[0], parts[1])
                    .header("Accept", "application/vnd.github+json")
                    .header("User-Agent", "SkillProof-MVP")
                    .retrieve().body(GitHubRepository.class);
            if (repo == null || repo.htmlUrl() == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub returned no repository details.");
            return new RepositoryPreview(repo.fullName(), repo.description() == null ? "" : repo.description(), repo.htmlUrl(), repo.language(), repo.topics() == null ? List.of() : repo.topics());
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 404) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Public repository not found. Check the owner and repository name.");
            if (exception.getStatusCode().value() == 403 || exception.getStatusCode().value() == 429) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "GitHub's public API rate limit was reached. Try again later.");
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub could not return this repository right now.");
        }
    }

    private String[] parseRepository(String raw) {
        try {
            URI uri = URI.create(raw.trim());
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
            if (!(host.equals("github.com") || host.equals("www.github.com"))) throw new IllegalArgumentException();
            String[] path = uri.getPath().split("/");
            if (path.length < 3 || !path[1].matches("[A-Za-z0-9-]{1,39}") || !path[2].replaceAll("\\.git$", "").matches("[A-Za-z0-9_.-]{1,100}")) throw new IllegalArgumentException();
            return new String[]{path[1], path[2].replaceAll("\\.git$", "")};
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid public GitHub repository URL, such as https://github.com/owner/repository.");
        }
    }

    public record RepositoryPreview(String name, String description, String url, String language, List<String> topics) { }
    public record GitHubRepository(@JsonProperty("full_name") String fullName, String description,
                                   @JsonProperty("html_url") String htmlUrl, String language, List<String> topics) { }
}
