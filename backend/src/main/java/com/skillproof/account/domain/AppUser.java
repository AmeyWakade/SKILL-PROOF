package com.skillproof.account.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id private UUID id;
    @Column(nullable = false, unique = true, length = 254) private String email;
    @Column(nullable = false, length = 100) private String passwordHash;
    @NotBlank @Size(max = 80) @Column(nullable = false, length = 80) private String displayName;
    @Size(max = 120) @Column(length = 120) private String headline = "";
    @Size(max = 1200) @Column(length = 1200) private String bio = "";
    @Size(max = 100) @Column(length = 100) private String location = "";
    @Size(max = 100) @Column(length = 100) private String targetRole = "";
    @Column(nullable = false) private Instant createdAt;
    @Column(nullable = false) private boolean publicProfileEnabled = false;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill", nullable = false, length = 40)
    @OrderColumn(name = "skill_order")
    private List<String> skills = new ArrayList<>();

    protected AppUser() { }
    public AppUser(UUID id, String email, String passwordHash, String displayName) {
        this.id = id; this.email = email; this.passwordHash = passwordHash; this.displayName = displayName;
        this.createdAt = Instant.now();
    }
    public void updateProfile(String displayName, String headline, String bio, String location, String targetRole, List<String> skills, boolean publicProfileEnabled) {
        this.displayName = displayName.trim(); this.headline = clean(headline); this.bio = clean(bio);
        this.location = clean(location); this.targetRole = clean(targetRole);
        this.publicProfileEnabled = publicProfileEnabled;
        this.skills = skills == null ? new ArrayList<>() : skills.stream().map(String::trim).filter(s -> !s.isBlank()).distinct().limit(12).collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }
    private String clean(String value) { return value == null ? "" : value.trim(); }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public String getHeadline() { return headline; }
    public String getBio() { return bio; }
    public String getLocation() { return location; }
    public String getTargetRole() { return targetRole; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isPublicProfileEnabled() { return publicProfileEnabled; }
    public List<String> getSkills() { return List.copyOf(skills); }
}
