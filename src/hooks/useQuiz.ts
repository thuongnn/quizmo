import {useEffect, useState} from 'react';
import {message} from 'antd';
import type {Question} from '../types/quiz';
import {getQuestionsByCourseId} from '../services/courseService';
import {getQuizState, resetQuizState, saveQuizState} from '../services/quizService';

// Import sound files
import correctSound from '../assets/sounds/correct.mp3';
import incorrectSound from '../assets/sounds/incorrect.mp3';

// Create audio objects
const correctAudio = new Audio(correctSound);
const incorrectAudio = new Audio(incorrectSound);

// Set volume
correctAudio.volume = 0.5;
incorrectAudio.volume = 0.5;

export const useQuiz = (courseId: string | null) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (!courseId) {
            message.warning('No course ID provided.');
            return;
        }

        const loadedQuestions = getQuestionsByCourseId(courseId);
        if (loadedQuestions.length === 0) {
            message.warning('No questions found for this course.');
            return;
        }

        setQuestions(loadedQuestions);

        // Load saved state if exists
        const savedState = getQuizState(courseId);
        if (savedState) {
            setCurrentIndex(savedState.currentIndex);
            setScore(savedState.score);
            setUserAnswers(savedState.userAnswers);
            if (savedState.currentIndex < loadedQuestions.length) {
                const savedAnswers = savedState.userAnswers[savedState.currentIndex]?.split(',') || [];
                setSelectedAnswers(savedAnswers);
                setShowResult(true);
                const correctAnswers = loadedQuestions[savedState.currentIndex].answer.split(',');
                setIsCorrect(savedAnswers.sort().join(',') === correctAnswers.sort().join(','));
            }
        }
    }, [courseId]);

    const playSound = (isCorrect: boolean) => {
        if (!isMuted) {
            if (isCorrect) {
                correctAudio.currentTime = 0;
                correctAudio.play().catch(console.error);
            } else {
                incorrectAudio.currentTime = 0;
                incorrectAudio.play().catch(console.error);
            }
        }
    };

    const handleAnswer = () => {
        if (selectedAnswers.length === 0) {
            message.warning('Please select at least one answer');
            return;
        }

        const correctAnswers = questions[currentIndex].answer.split(',');
        // Check if all selected answers are correct and all correct answers are selected
        const isAnswerCorrect =
            selectedAnswers.length === correctAnswers.length &&
            selectedAnswers.every(answer => correctAnswers.includes(answer)) &&
            correctAnswers.every(answer => selectedAnswers.includes(answer));

        setIsCorrect(isAnswerCorrect);

        if (isAnswerCorrect) {
            setScore(prev => prev + 1);
            playSound(true);
            message.success('Correct!', 1);
        } else {
            playSound(false);
            message.error('Incorrect!', 1);
        }

        setShowResult(true);

        // Save answer to userAnswers array
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentIndex] = selectedAnswers.join(',');
        setUserAnswers(newUserAnswers);
        saveQuizState(courseId!, {
            questions,
            currentIndex,
            score,
            userAnswers: newUserAnswers,
        });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            const nextAnswers = userAnswers[currentIndex + 1]?.split(',') || [];
            setSelectedAnswers(nextAnswers);
            setShowResult(false);
            setIsCorrect(null);
        } else {
            message.success(`Quiz completed! Your score: ${score}/${questions.length}`);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setSelectedAnswers([]);
        setShowResult(false);
        setIsCorrect(null);
        setScore(0);
        setUserAnswers([]);
        resetQuizState(courseId!);
        message.success('Quiz has been reset');
    };

    const handleOptionChange = (key: string, checked: boolean) => {
        const correctAnswers = questions[currentIndex].answer.split(',');
        const isMultipleAnswer = correctAnswers.length > 1;

        if (isMultipleAnswer) {
            if (checked) {
                setSelectedAnswers(prev => [...prev, key]);
            } else {
                setSelectedAnswers(prev => prev.filter(k => k !== key));
            }
        } else {
            setSelectedAnswers([key]);
        }
    };

    return {
        questions,
        currentIndex,
        selectedAnswers,
        showResult,
        score,
        isCorrect,
        userAnswers,
        isMuted,
        setIsMuted,
        handleAnswer,
        handleNext,
        handleReset,
        handleOptionChange,
    };
}; 