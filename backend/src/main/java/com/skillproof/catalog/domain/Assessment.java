package com.skillproof.catalog.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assessments")
public class Assessment {
    @Id private UUID id;
    @NotBlank @Size(max = 120) @Column(nullable = false, length = 120) private String title;
    @NotBlank @Size(max = 80) @Column(nullable = false, length = 80) private String category;
    @NotBlank @Size(max = 24) @Column(nullable = false, length = 24) private String level;
    @NotBlank @Size(max = 600) @Column(nullable = false, length = 600) private String summary;
    @Min(1) @Column(nullable = false) private int durationMinutes;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "assessment_skills", joinColumns = @JoinColumn(name = "assessment_id"))
    @Column(name = "skill", nullable = false, length = 40)
    @OrderColumn(name = "skill_order")
    private List<String> skills = new ArrayList<>();

    protected Assessment() { }
    public Assessment(UUID id, String title, String category, String level, String summary, int durationMinutes, List<String> skills) {
        this.id = id; this.title = title; this.category = category; this.level = level;
        this.summary = summary; this.durationMinutes = durationMinutes; this.skills = new ArrayList<>(skills);
    }
    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getLevel() { return level; }
    public String getSummary() { return summary; }
    public int getDurationMinutes() { return durationMinutes; }
    public List<String> getSkills() { return List.copyOf(skills); }
}
