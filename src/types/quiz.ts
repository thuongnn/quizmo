export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface QuizState {
    questions: Question[];
    currentIndex: number;
    score: number;
    userAnswers: string[];
    incorrectQuestions: Question[]; // Track questions that were answered incorrectly
    learnedQuestions: Question[];
    currentTurn: number; // Track current turn number
    questionsPerTurn: number; // Number of questions per turn
    reviewQuestionsPerTurn: number; // Number of review questions per turn
} 