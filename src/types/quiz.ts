export interface Question {
    id: string;
    question: string;
    options: Record<string, string>;
    answer: string;
}

export interface QuizState {
    incorrectQuestions: Question[]; // Track questions that were answered incorrectly
    learnedQuestions: Question[];
    chatgptHistory?: any[]; // Add this line to store chat history
} 