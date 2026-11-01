package com.skillproof.proof.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class PracticeAnswerReview {
    @Column(name = "question_prompt", nullable = false, length = 600)
    private String question;
    @Column(name = "selected_answer", nullable = false, length = 400)
    private String selectedAnswer;
    @Column(name = "correct_answer", nullable = false, length = 400)
    private String correctAnswer;
    @Column(name = "answer_explanation", nullable = false, length = 1000)
    private String explanation;

    protected PracticeAnswerReview() { }

    public PracticeAnswerReview(String question, String selectedAnswer, String correctAnswer, String explanation) {
        this.question = question;
        this.selectedAnswer = selectedAnswer;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
    }

    public String getQuestion() { return question; }
    public String getSelectedAnswer() { return selectedAnswer; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getExplanation() { return explanation; }
    public boolean isCorrect() { return selectedAnswer.equals(correctAnswer); }
}
