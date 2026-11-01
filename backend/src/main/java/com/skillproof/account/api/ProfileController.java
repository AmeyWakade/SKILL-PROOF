package com.skillproof.account.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.portfolio.application.CareerProfileProjection;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {
    private final AppUserRepository users;
    private final CareerProfileProjection publicProfile;
    public ProfileController(AppUserRepository users, CareerProfileProjection publicProfile) {
        this.users = users; this.publicProfile = publicProfile;
    }

    @GetMapping
    public UserResponse get(Principal principal) { return UserResponse.from(findUser(principal.getName())); }

    @GetMapping("/preview")
    @Transactional(readOnly = true)
    public CareerProfileProjection.CareerProfileView preview(Principal principal) {
        return publicProfile.from(findUser(principal.getName()));
    }

    @PutMapping
    @Transactional
    public UserResponse update(@Valid @RequestBody ProfileUpdateRequest request, Principal principal) {
        AppUser user = findUser(principal.getName());
        user.updateProfile(request.displayName(), request.headline(), request.bio(), request.location(), request.targetRole(),
                request.skills(), request.publicProfileEnabled(), request.publicCareerDetailsEnabled(), request.publicSkillsEnabled());
        return UserResponse.from(user);
    }

    private AppUser findUser(String email) { return users.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElseThrow(); }
}
