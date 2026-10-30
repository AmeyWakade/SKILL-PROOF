package com.skillproof.catalog.application;

import com.skillproof.catalog.domain.Assessment;
import com.skillproof.catalog.domain.AssessmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;
import java.util.UUID;

@Configuration
public class SampleData {
    @Bean CommandLineRunner seedAssessments(AssessmentRepository repository) {
        return args -> {
            if (repository.count() > 0) return;
            repository.saveAll(List.of(
                item("Java fundamentals: collections and streams", "Backend", "Beginner", "Show how you model a small problem, choose collections, and transform data with clear Java code.", 25, "Java", "Collections", "Streams"),
                item("Design a dependable REST API", "Backend", "Intermediate", "Demonstrate API design, validation, error handling, and resource modeling with Spring Boot.", 35, "Spring Boot", "REST", "Java"),
                item("React state and component thinking", "Frontend", "Beginner", "Build confidence in component boundaries, state updates, and accessible interactive UI.", 30, "React", "JavaScript", "Accessibility"),
                item("SQL queries for product analytics", "Data", "Intermediate", "Use joins, grouping, and careful filters to answer realistic questions from product data.", 30, "SQL", "PostgreSQL", "Analytics"),
                item("Secure authentication foundations", "Security", "Advanced", "Reason about identity, authorization, password storage, and safe defaults in a web product.", 40, "Spring Security", "OWASP", "Java"),
                item("Python automation essentials", "Backend", "Beginner", "Use Python data structures, functions, files, and tests to automate a practical task.", 30, "Python", "Automation", "Testing"),
                item("Cloud deployment and DevOps basics", "Cloud & DevOps", "Intermediate", "Explore containers, CI/CD, cloud configuration, and operational reliability.", 35, "Docker", "CI/CD", "Cloud"),
                item("Accessible UI and UX foundations", "UI/UX", "Beginner", "Evaluate interface usability, accessibility, and design decisions for real users.", 30, "UX Research", "Accessibility", "UI Design"),
                item("Data science and machine learning basics", "Data Science", "Intermediate", "Reason about data preparation, model selection, evaluation, and responsible use.", 35, "Python", "Statistics", "Machine Learning"),
                item("Product thinking and prioritization", "Product", "Beginner", "Turn customer needs into clear outcomes, experiments, and prioritized work.", 25, "Product Strategy", "User Research", "Metrics"),
                item("Software testing and quality assurance", "Quality Assurance", "Beginner", "Identify test scenarios, choose testing layers, and report software defects clearly.", 30, "Testing", "QA", "Automation")
            ));
        };
    }
    private Assessment item(String title, String category, String level, String summary, int minutes, String... skills) {
        return new Assessment(UUID.randomUUID(), title, category, level, summary, minutes, List.of(skills));
    }
}
