package com.skillproof.account.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProfileUpdateRequest(@NotBlank @Size(max = 80) String displayName,
                                   @Size(max = 120) String headline,
                                   @Size(max = 1200) String bio,
                                   @Size(max = 100) String location,
                                   @Size(max = 100) String targetRole,
                                   List<@Size(max = 40) String> skills,
                                   boolean publicProfileEnabled) { }
