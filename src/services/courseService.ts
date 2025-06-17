import type {Course} from '../types/course';
import type {Question} from '../types/quiz';
import {STORAGE_KEYS} from '../constants/storage';

const COURSES_KEY = STORAGE_KEYS.COURSES;

export const generateCourseId = (): string => {
    return 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const getCourses = (): Course[] => {
    const coursesJson = localStorage.getItem(COURSES_KEY);
    return coursesJson ? JSON.parse(coursesJson) : [];
};

export const getCourseById = (id: string): Course | undefined => {
    const courses = getCourses();
    return courses.find(course => course.id === id);
};

export const saveCourse = (course: Omit<Course, 'id'> | Course): Course => {
    const courses = getCourses();
    let updatedCourse: Course;

    if ('id' in course) {
        // Update existing course
        const existingCourseIndex = courses.findIndex(c => c.id === course.id);
        if (existingCourseIndex === -1) {
            throw new Error('Course not found');
        }
        updatedCourse = course as Course;
        courses[existingCourseIndex] = updatedCourse;
    } else {
        // Create new course
        updatedCourse = {
            ...course,
            id: generateCourseId(),
            createdAt: Date.now()
        };
        courses.push(updatedCourse);
    }

    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return updatedCourse;
};

export const getQuestionsByCourseId = (courseId: string): Question[] => {
    const courses = getCourses();
    const course = courses.find(c => c.id === courseId);
    return course?.questions || [];
};

export const deleteCourse = (courseId: string): void => {
    const courses = getCourses();
    const updatedCourses = courses.filter(course => course.id !== courseId);
    localStorage.setItem(COURSES_KEY, JSON.stringify(updatedCourses));
}; 