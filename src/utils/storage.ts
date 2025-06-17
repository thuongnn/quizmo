import type {Question, QuizState} from '../types/quiz';

const COURSES_KEY = 'courses';
const QUIZ_STATE_KEY = 'quiz_state';

export interface Course {
    id: string;
    name: string;
    description?: string;
    questions: Question[];
    createdAt: number;
}

export const generateCourseId = (): string => {
    return 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const saveCourse = (course: Omit<Course, 'id'>): Course => {
    const courses = getCourses();
    const newCourse: Course = {
        ...course,
        id: generateCourseId(),
        createdAt: Date.now()
    };
    courses.push(newCourse);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return newCourse;
};

export const getCourses = (): Course[] => {
    const courses = localStorage.getItem(COURSES_KEY);
    return courses ? JSON.parse(courses) : [];
};

export const getQuestionsByCourseId = (courseId: string): Question[] => {
    const courses = getCourses();
    const course = courses.find(c => c.id === courseId);
    return course?.questions || [];
};

export const saveQuizState = (state: QuizState): void => {
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
};

export const getQuizState = (): QuizState | null => {
    const state = localStorage.getItem(QUIZ_STATE_KEY);
    return state ? JSON.parse(state) : null;
};

export const resetQuizState = (): void => {
    localStorage.removeItem(QUIZ_STATE_KEY);
}; 