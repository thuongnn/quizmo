import { STORAGE_KEYS } from '../constants/storage';

// Helper functions for test storage management

export const getSeenQuestionsKey = (courseId: string) => `${STORAGE_KEYS.TEST_SEEN_QUESTIONS}_${courseId}`;
export const getWrongQuestionsKey = (courseId: string) => `${STORAGE_KEYS.TEST_WRONG_QUESTIONS}_${courseId}`;

export const getSeenQuestions = (courseId: string): string[] => {
    if (!courseId) return [];
    const raw = localStorage.getItem(getSeenQuestionsKey(courseId));
    if (!raw) return [];
    try {
        return JSON.parse(raw) as string[];
    } catch {
        return [];
    }
};

export const setSeenQuestions = (courseId: string, ids: string[]): void => {
    if (!courseId) return;
    localStorage.setItem(getSeenQuestionsKey(courseId), JSON.stringify(ids));
};

export const getWrongQuestions = (courseId: string): string[] => {
    if (!courseId) return [];
    const raw = localStorage.getItem(getWrongQuestionsKey(courseId));
    if (!raw) return [];
    try {
        return JSON.parse(raw) as string[];
    } catch {
        return [];
    }
};

export const setWrongQuestions = (courseId: string, ids: string[]): void => {
    if (!courseId) return;
    localStorage.setItem(getWrongQuestionsKey(courseId), JSON.stringify(ids));
};

export const resetWrongQuestions = (courseId: string): void => {
    if (!courseId) return;
    localStorage.removeItem(getWrongQuestionsKey(courseId));
};

export const getTestingOptions = () => {
    const savedOptions = localStorage.getItem(STORAGE_KEYS.TESTING_OPTIONS);
    if (savedOptions) {
        try {
            return JSON.parse(savedOptions);
        } catch (error) {
            console.error('Failed to parse testing options from localStorage:', error);
        }
    }
    return null;
};

export const setTestingOptions = (options: { testDuration: number; totalQuestions: number }): void => {
    localStorage.setItem(STORAGE_KEYS.TESTING_OPTIONS, JSON.stringify(options));
}; 