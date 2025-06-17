export interface Question {
    question: string;
    options: {
        [key: string]: string; // key: A, B, C, D... value: option text
    };
    answer: string; // comma-separated keys of correct options (e.g., "A,D")
}

export interface QuizState {
    questions: Question[];
    currentIndex: number;
    score: number;
    userAnswers: string[];
} 