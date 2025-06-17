import type { Course } from '../types/course';
import type { Question } from '../types/quiz';
import { STORAGE_KEYS } from '../constants/storage';

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
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  return newCourse;
};

export const getCourses = (): Course[] => {
  const courses = localStorage.getItem(STORAGE_KEYS.COURSES);
  return courses ? JSON.parse(courses) : [];
};

export const getQuestionsByCourseId = (courseId: string): Question[] => {
  const courses = getCourses();
  const course = courses.find(c => c.id === courseId);
  return course?.questions || [];
};

export const deleteCourse = (courseId: string): void => {
  const courses = getCourses();
  const updatedCourses = courses.filter(course => course.id !== courseId);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));
}; 