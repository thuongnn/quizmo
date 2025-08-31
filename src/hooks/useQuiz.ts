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
            // Prepare questions for current turn with loaded state
            prepareQuestionsForTurn(
                loadedQuestions, 
                savedState?.incorrectQuestions || [], 
                savedState?.learnedQuestions || []
            );
        } else {
            // No saved state, prepare with empty learned questions
            prepareQuestionsForTurn(loadedQuestions, [], []);
        }
    }, [courseId]);

    const prepareQuestionsForTurn = (
        allQuestions: Question[], 
        previousIncorrectQuestions: Question[], 
        currentLearnedQuestions: Question[] = learnedQuestions
    ) => {
        let turnQuestions: Question[] = [];

        // Ưu tiên lấy REVIEW_QUESTIONS_PER_TURN từ incorrectQuestions (không lấy trùng)
        const shuffledIncorrect = [...previousIncorrectQuestions].sort(() => 0.5 - Math.random());
        const reviewQuestions = shuffledIncorrect.slice(0, REVIEW_QUESTIONS_PER_TURN);
        turnQuestions = [...reviewQuestions];

        // Loại bỏ các câu đã làm đúng và TẤT CẢ incorrect questions khỏi pool random
        const learnedIds = new Set(currentLearnedQuestions.map(q => q.id));
        const allIncorrectIds = new Set(previousIncorrectQuestions.map(q => q.id)); // Fix: Exclude all incorrect
        const availableQuestions = allQuestions.filter(q =>
            !learnedIds.has(q.id) && !allIncorrectIds.has(q.id)
        );

        // Fill remaining slots with new questions
        const remainingSlots = QUESTIONS_PER_TURN - turnQuestions.length;
        const finalQuestions = [...turnQuestions, ...availableQuestions.sort(() => 0.5 - Math.random()).slice(0, remainingSlots)];
        
        console.log('🔍 prepareQuestionsForTurn Debug:', {
            totalQuestions: allQuestions.length,
            learnedCount: currentLearnedQuestions.length,
            incorrectCount: previousIncorrectQuestions.length,
            reviewCount: reviewQuestions.length,
            availableCount: availableQuestions.length,
            finalCount: finalQuestions.length
        });
        
        setQuestions(finalQuestions);
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

        const correctAnswers = questions[currentIndex].answer.split(',').map(a => a.trim());
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
                    return updated;
                }
                return prev;
            });

            // If this was a review question (from incorrectQuestions), remove it
            const isReviewQuestion = incorrectQuestions.some(q => q.question === currentQuestion.question);
            if (isReviewQuestion) {
                setIncorrectQuestions(prev => {
                    const updated = prev.filter(q => q.question !== currentQuestion.question);
                    return updated;
                });
                message.success('Great job! This question has been removed from review.', 2);
            }

            // Save state after all updates (use setTimeout to ensure state updates)
            setTimeout(() => {
                const currentState = getQuizState(courseId!);
                const updatedLearnedQuestions = learnedQuestions.some(q => q.question === currentQuestion.question) 
                    ? learnedQuestions 
                    : [...learnedQuestions, currentQuestion];
                const updatedIncorrectQuestions = isReviewQuestion 
                    ? incorrectQuestions.filter(q => q.question !== currentQuestion.question)
                    : incorrectQuestions;
                    
                saveQuizState(courseId!, {
                    incorrectQuestions: updatedIncorrectQuestions,
                    learnedQuestions: updatedLearnedQuestions,
                    chatgptHistory: currentState?.chatgptHistory || [],
                });
            }, 0);
        } else {
            playSound(false);
            message.error('Incorrect!', 1);
            // Add to incorrect questions if not already present
            const currentQuestion = questions[currentIndex];
            setIncorrectQuestions(prev => {
                if (!prev.some(q => q.question === currentQuestion.question)) {
                    const updated = [...prev, currentQuestion];
                    
                    // Save state immediately for incorrect answers
                    setTimeout(() => {
                        const currentState = getQuizState(courseId!);
                        saveQuizState(courseId!, {
                            incorrectQuestions: updated,
                            learnedQuestions,
                            chatgptHistory: currentState?.chatgptHistory || [],
                        });
                    }, 0);
                    
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

            // Prepare questions for next turn - use latest state from localStorage
            const allQuestions = getQuestionsByCourseId(courseId!);
            const latestState = getQuizState(courseId!);
            prepareQuestionsForTurn(
                allQuestions, 
                latestState?.incorrectQuestions || incorrectQuestions,
                latestState?.learnedQuestions || learnedQuestions
            );
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
        prepareQuestionsForTurn(allQuestions, [], []);

        message.success('Quiz has been reset');
    };

    const handleOptionChange = (key: string, checked: boolean) => {
        const correctAnswers = questions[currentIndex].answer.split(',').map(a => a.trim());
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