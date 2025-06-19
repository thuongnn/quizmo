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
    const [score, setScore] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);
    const [currentTurn, setCurrentTurn] = useState(1);
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
            setCurrentIndex(savedState.currentIndex);
            setScore(savedState.score);
            setUserAnswers(savedState.userAnswers);
            setIncorrectQuestions(savedState.incorrectQuestions || []);
            setCurrentTurn(savedState.currentTurn || 1);
            setLearnedQuestions(savedState.learnedQuestions || []);
            if (savedState.currentIndex < loadedQuestions.length) {
                const savedAnswers = savedState.userAnswers[savedState.currentIndex]?.split(',') || [];
                setSelectedAnswers(savedAnswers);
                setShowResult(true);
                const correctAnswers = loadedQuestions[savedState.currentIndex].answer.split(',');
                setIsCorrect(savedAnswers.sort().join(',') === correctAnswers.sort().join(','));
            }
        }

        // Prepare questions for current turn
        prepareQuestionsForTurn(loadedQuestions, savedState?.incorrectQuestions || []);
    }, [courseId]);

    const prepareQuestionsForTurn = (allQuestions: Question[], previousIncorrectQuestions: Question[]) => {
        let turnQuestions: Question[] = [];

        // If we have previous incorrect questions and it's not the first turn
        if (previousIncorrectQuestions.length > 0 && currentTurn > 1) {
            const reviewQuestions = previousIncorrectQuestions.slice(0, REVIEW_QUESTIONS_PER_TURN);
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

            // Add to learned questions if not already present
            const currentQuestion = questions[currentIndex];
            setLearnedQuestions(prev => {
                if (!prev.some(q => q.question === currentQuestion.question)) {
                    return [...prev, currentQuestion];
                }
                return prev;
            });

            // If this was a review question (from incorrectQuestions), remove it
            const isReviewQuestion = incorrectQuestions.some(q => q.question === currentQuestion.question);
            if (isReviewQuestion) {
                setIncorrectQuestions(prev => prev.filter(q => q.question !== currentQuestion.question));
                message.success('Great job! This question has been removed from review.', 2);
            }
        } else {
            playSound(false);
            message.error('Incorrect!', 1);
            // Add to incorrect questions if not already present
            setIncorrectQuestions(prev => {
                if (!prev.some(q => q.question === questions[currentIndex].question)) {
                    return [...prev, questions[currentIndex]];
                }
                return prev;
            });
        }

        setShowResult(true);

        // Save answer to userAnswers array
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentIndex] = selectedAnswers.join(',');
        setUserAnswers(newUserAnswers);
        const oldState = getQuizState(courseId!);
        saveQuizState(courseId!, {
            questions,
            currentIndex,
            score,
            userAnswers: newUserAnswers,
            incorrectQuestions,
            learnedQuestions,
            currentTurn,
            questionsPerTurn: QUESTIONS_PER_TURN,
            reviewQuestionsPerTurn: REVIEW_QUESTIONS_PER_TURN,
            chatgptHistory: oldState?.chatgptHistory || [],
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
            // End of current turn
            message.success(`Turn ${currentTurn} completed! Your score: ${score}/${questions.length}`);
            setCurrentTurn(prev => prev + 1);
            setCurrentIndex(0);
            setScore(0);
            setUserAnswers([]);
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
        setScore(0);
        setUserAnswers([]);
        setIncorrectQuestions([]);
        setLearnedQuestions([]);
        setCurrentTurn(1);
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
        score,
        isCorrect,
        userAnswers,
        isMuted,
        setIsMuted,
        handleAnswer,
        handleNext,
        handleReset,
        handleOptionChange,
        currentTurn,
        incorrectQuestions,
        totalQuestions,
        learnedQuestions,
    };
}; 