package com.skillproof.proof.api;

import com.skillproof.account.domain.AppUser;
import com.skillproof.account.domain.AppUserRepository;
import com.skillproof.portfolio.application.CareerProfileProjection;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public-profiles")
public class PublicProfileController {
    private final AppUserRepository users;
    private final CareerProfileProjection publicProfile;
    public PublicProfileController(AppUserRepository users, CareerProfileProjection publicProfile) {
        this.users = users; this.publicProfile = publicProfile;
    }

    @GetMapping("/{userId}")
    @Transactional(readOnly = true)
    public CareerProfileProjection.CareerProfileView get(@PathVariable UUID userId) {
        AppUser user = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        if (!user.isPublicProfileEnabled()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This profile is private");
        return publicProfile.from(user);
    }
}
