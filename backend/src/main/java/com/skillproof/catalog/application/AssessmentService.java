package com.skillproof.catalog.application;

import com.skillproof.catalog.api.AssessmentResponse;
import com.skillproof.catalog.domain.Assessment;
import com.skillproof.catalog.domain.AssessmentRepository;
import com.skillproof.shared.NotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AssessmentService {
    private final AssessmentRepository repository;
    public AssessmentService(AssessmentRepository repository) { this.repository = repository; }

    public List<AssessmentResponse> findAll(String query, String skill) {
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String tag = skill == null ? "" : skill.trim().toLowerCase(Locale.ROOT);
        return repository.findAllByOrderByTitleAsc().stream()
                .filter(item -> q.isBlank() || searchable(item).contains(q))
                .filter(item -> tag.isBlank() || item.getSkills().stream().anyMatch(s -> s.toLowerCase(Locale.ROOT).equals(tag)))
                .map(AssessmentResponse::from).toList();
    }
    public AssessmentResponse findById(UUID id) {
        Assessment item = repository.findById(id).orElseThrow(() -> new NotFoundException("Assessment not found"));
        return AssessmentResponse.from(item);
    }
    private String searchable(Assessment item) {
        return (item.getTitle() + " " + item.getCategory() + " " + item.getSummary() + " " + String.join(" ", item.getSkills())).toLowerCase(Locale.ROOT);
    }
}
