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

export const QUESTIONS_PER_TURN = 8;
export const REVIEW_QUESTIONS_PER_TURN = 4;

export const useQuiz = (courseId: string | null) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);
    const [totalQuestions, setTotalQuestions] = useState<Question[]>([]);
    const [learnedQuestions, setLearnedQuestions] = useState<Question[]>([]);

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

        setTotalQuestions(loadedQuestions);

        // Load saved state if exists
        const savedState = getQuizState(courseId);
        if (savedState) {
            setIncorrectQuestions(savedState.incorrectQuestions || []);
            setLearnedQuestions(savedState.learnedQuestions || []);
        }

        // Prepare questions for current turn
        prepareQuestionsForTurn(loadedQuestions, savedState?.incorrectQuestions || []);
    }, [courseId]);

    const prepareQuestionsForTurn = (allQuestions: Question[], previousIncorrectQuestions: Question[]) => {
        let turnQuestions: Question[] = [];

        // If we have previous incorrect questions and it's not the first turn
        if (previousIncorrectQuestions.length > 0 && currentIndex > 0) {
            // Randomly select review questions from previous incorrect questions
            const shuffledIncorrect = [...previousIncorrectQuestions].sort(() => 0.5 - Math.random());
            const reviewQuestions = shuffledIncorrect.slice(0, REVIEW_QUESTIONS_PER_TURN);
            turnQuestions = [...reviewQuestions];
        }

        // Fill remaining slots with new questions
        const remainingSlots = QUESTIONS_PER_TURN - turnQuestions.length;
        const availableQuestions = allQuestions.filter(q =>
            !turnQuestions.some(tq => tq.question === q.question) &&
            !learnedQuestions.some(lq => lq.question === q.question)
        );
        turnQuestions = [...turnQuestions, ...availableQuestions.slice(0, remainingSlots)];
        setQuestions(turnQuestions);
    };

    const playSound = (isCorrect: boolean) => {
        if (isCorrect) {
            correctAudio.currentTime = 0;
            correctAudio.play().catch(console.error);
        } else {
            incorrectAudio.currentTime = 0;
            incorrectAudio.play().catch(console.error);
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
            playSound(true);
            message.success('Correct!', 1);

            // Add to learned questions if not already present
            const currentQuestion = questions[currentIndex];
            setLearnedQuestions(prev => {
                if (!prev.some(q => q.question === currentQuestion.question)) {
                    const updated = [...prev, currentQuestion];
                    // Save to localStorage
                    const oldState = getQuizState(courseId!);
                    saveQuizState(courseId!, {
                        incorrectQuestions,
                        learnedQuestions: updated,
                        chatgptHistory: oldState?.chatgptHistory || [],
                    });
                    return updated;
                }
                return prev;
            });

            // If this was a review question (from incorrectQuestions), remove it
            const isReviewQuestion = incorrectQuestions.some(q => q.question === currentQuestion.question);
            if (isReviewQuestion) {
                setIncorrectQuestions(prev => {
                    const updated = prev.filter(q => q.question !== currentQuestion.question);
                    // Save to localStorage
                    const oldState = getQuizState(courseId!);
                    saveQuizState(courseId!, {
                        incorrectQuestions: updated,
                        learnedQuestions,
                        chatgptHistory: oldState?.chatgptHistory || [],
                    });
                    return updated;
                });
                message.success('Great job! This question has been removed from review.', 2);
            }
        } else {
            playSound(false);
            message.error('Incorrect!', 1);
            // Add to incorrect questions if not already present
            setIncorrectQuestions(prev => {
                if (!prev.some(q => q.question === questions[currentIndex].question)) {
                    const updated = [...prev, questions[currentIndex]];
                    // Save to localStorage
                    const oldState = getQuizState(courseId!);
                    saveQuizState(courseId!, {
                        incorrectQuestions: updated,
                        learnedQuestions,
                        chatgptHistory: oldState?.chatgptHistory || [],
                    });
                    return updated;
                }
                return prev;
            });
        }

        setShowResult(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswers([]);
            setShowResult(false);
            setIsCorrect(null);
        } else {
            // End of current turn
            setCurrentIndex(0);
            setSelectedAnswers([]);
            setShowResult(false);
            setIsCorrect(null);

            // Prepare questions for next turn
            const allQuestions = getQuestionsByCourseId(courseId!);
            prepareQuestionsForTurn(allQuestions, incorrectQuestions);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setSelectedAnswers([]);
        setShowResult(false);
        setIsCorrect(null);
        setIncorrectQuestions([]);
        setLearnedQuestions([]);
        resetQuizState(courseId!);

        // Prepare questions for new turn
        const allQuestions = getQuestionsByCourseId(courseId!);
        prepareQuestionsForTurn(allQuestions, []);

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
        isCorrect,
        handleAnswer,
        handleNext,
        handleReset,
        handleOptionChange,
        incorrectQuestions,
        totalQuestions,
        learnedQuestions,
    };
}; 