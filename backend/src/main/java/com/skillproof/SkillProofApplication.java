package com.skillproof;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class SkillProofApplication {
    public static void main(String[] args) {
        try {
            Files.createDirectories(Path.of("data"));
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Could not create the local data directory", exception);
        }
        SpringApplication.run(SkillProofApplication.class, args);
    }
}
