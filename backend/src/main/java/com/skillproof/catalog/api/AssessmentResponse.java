package com.skillproof.catalog.api;

import com.skillproof.catalog.domain.Assessment;
import java.util.List;
import java.util.UUID;

public record AssessmentResponse(UUID id, String title, String category, String level, String summary, int durationMinutes, List<String> skills) {
    public static AssessmentResponse from(Assessment item) {
        return new AssessmentResponse(item.getId(), item.getTitle(), item.getCategory(), item.getLevel(), item.getSummary(), item.getDurationMinutes(), item.getSkills());
    }
}
