package com.skillproof.account.api;

import com.skillproof.account.domain.AppUser;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserResponse(UUID id, String email, String displayName, String headline, String bio,
                           String location, String targetRole, List<String> skills, Instant createdAt,
                           boolean publicProfileEnabled) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getHeadline(),
                user.getBio(), user.getLocation(), user.getTargetRole(), user.getSkills(), user.getCreatedAt(), user.isPublicProfileEnabled());
    }
}
