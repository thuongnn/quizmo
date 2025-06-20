import {useCallback, useEffect, useState} from 'react';
import {Button, Card, Checkbox, Col, message, Modal, Progress, Radio, Row, Space, Spin, Typography} from 'antd';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {getCourseById, getQuestionsByCourseId} from '../services/courseService';
import type {Question} from '../types/quiz';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';

const {Title, Text} = Typography;

const TEST_DURATION = 120 * 60; // 2 hours in seconds
const TOTAL_QUESTIONS = 65;

// Memoized Question Card component
const QuestionCard = ({
                          question,
                          index,
                          selectedAnswers,
                          onOptionChange,
                          isReviewMode = false
                      }: {
    question: Question;
    index: number;
    selectedAnswers: string[];
    onOptionChange: (index: number, key: string, checked: boolean) => void;
    isReviewMode?: boolean;
}) => {
    const correctAnswers = question.answer.split(',');
    const isMultipleAnswer = correctAnswers.length > 1;

    const isOptionCorrect = (key: string) => {
        return correctAnswers.includes(key);
    };

    const isOptionSelected = (key: string) => {
        return selectedAnswers.includes(key);
    };

    const getOptionStyle = (key: string) => {
        const styles = {marginRight: 8};

        if (!isReviewMode) return styles;

        if (isOptionCorrect(key) && isOptionSelected(key)) {
            return {...styles, color: '#52c41a'}; // Green for correct selected
        }
        if (isOptionCorrect(key) && !isOptionSelected(key)) {
            return {...styles, color: '#52c41a'}; // Green for correct not selected
        }
        if (!isOptionCorrect(key) && isOptionSelected(key)) {
            return {...styles, color: '#ff4d4f'}; // Red for incorrect selected
        }
        return {};
    };

    return (
        <Card size="small">
            <Space direction="vertical" style={{width: '100%'}} size={8}>
                <Text strong>Question {index + 1}:</Text>
                <div dangerouslySetInnerHTML={{__html: question.question}} style={{whiteSpace: 'pre-line'}}/>
                <Space direction="vertical" style={{width: '100%'}}>
                    {Object.entries(question.options).map(([key, value]) => (
                        <div
                            key={key}
                            onClick={() => !isReviewMode && onOptionChange(index, key, !selectedAnswers.includes(key))}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                cursor: isReviewMode ? 'default' : 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: selectedAnswers.includes(key) ? '#e6f7ff' : 'transparent',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            {isMultipleAnswer ? (
                                <Checkbox
                                    checked={selectedAnswers.includes(key)}
                                    onChange={(e) => onOptionChange(index, key, e.target.checked)}
                                    style={{marginTop: 2}}
                                    disabled={isReviewMode}
                                />
                            ) : (
                                <Radio
                                    checked={selectedAnswers.includes(key)}
                                    onChange={() => onOptionChange(index, key, true)}
                                    style={{marginTop: 2}}
                                    disabled={isReviewMode}
                                />
                            )}
                            <Text style={getOptionStyle(key)}>
                                <Text strong style={getOptionStyle(key)}>{key}.</Text>
                                <span dangerouslySetInnerHTML={{__html: value}}/>
                            </Text>
                        </div>
                    ))}
                </Space>
            </Space>
        </Card>
    );
};

const Test = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('courseId');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isSubmitConfirmVisible, setIsSubmitConfirmVisible] = useState(false);
    const [isExitConfirmVisible, setIsExitConfirmVisible] = useState(false);
    const [testName, setTestName] = useState('');

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ""; // Chrome requires returnValue to be set
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                setIsLoading(true);
                if (!courseId) {
                    navigate('/');
                    return;
                }

                const loadedQuestions = getQuestionsByCourseId(courseId);
                // if (loadedQuestions.length < TOTAL_QUESTIONS) {
                //     messageApi.error('Not enough questions for a full test');
                //     navigate('/');
                //     return;
                // }

                // Get test name from courseId
                const course = getCourseById(courseId);
                if (course) {
                    setTestName(course.name);
                }

                // Randomly select 65 questions
                const shuffled = [...loadedQuestions].sort(() => 0.5 - Math.random());
                setQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
            } catch (error) {
                console.log(error);
                messageApi.error('Failed to load questions');
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        loadQuestions();
    }, [courseId, navigate, messageApi]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionChange = useCallback((questionIndex: number, key: string, checked: boolean) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionIndex] || [];
            const correctAnswers = questions[questionIndex].answer.split(',');
            const isMultipleAnswer = correctAnswers.length > 1;

            if (isMultipleAnswer) {
                if (checked) {
                    return {
                        ...prev,
                        [questionIndex]: [...currentAnswers, key]
                    };
                } else {
                    return {
                        ...prev,
                        [questionIndex]: currentAnswers.filter(k => k !== key)
                    };
                }
            } else {
                return {
                    ...prev,
                    [questionIndex]: [key]
                };
            }
        });
    }, [questions]);

    const calculateScore = useCallback(() => {
        let correct = 0;
        let answered = 0;
        questions.forEach((question, index) => {
            const userAnswers = answers[index] || [];
            if (userAnswers.length > 0) {
                answered++;
                const correctAnswers = question.answer.split(',');

                const isAnswerCorrect =
                    userAnswers.length === correctAnswers.length &&
                    userAnswers.every(answer => correctAnswers.includes(answer)) &&
                    correctAnswers.every(answer => userAnswers.includes(answer));

                if (isAnswerCorrect) {
                    correct++;
                }
            }
        });
        return {
            correct,
            answered,
            total: TOTAL_QUESTIONS,
            percentage: answered > 0 ? Math.round((correct / answered) * 100) : 0
        };
    }, [questions, answers]);

    const handleSubmit = () => {
        if (isSubmitted) return;
        setIsSubmitConfirmVisible(true);
    };

    const handleConfirmSubmit = () => {
        setIsSubmitted(true);
        setIsTimerRunning(false);
        setIsResultsModalVisible(true);
        setIsSubmitConfirmVisible(false);
    };

    const handleExit = () => {
        if (isSubmitted) {
            navigate('/test', {replace: true});
        } else {
            setIsExitConfirmVisible(true);
        }
    };

    const handleConfirmExit = () => {
        navigate('/test', {replace: true});
    };

    const handleQuestionClick = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const getQuestionButtonStyle = (index: number) => {
        const isAnswered = answers[index] !== undefined;
        const isCorrect = isSubmitted && isAnswered &&
            (Array.isArray(answers[index])
                ? new Set(answers[index]).size === new Set(questions[index].answer.split(',').map(a => a.trim())).size &&
                new Set(answers[index]).size === new Set([...answers[index], ...questions[index].answer.split(',').map(a => a.trim())]).size
                : answers[index] === questions[index].answer);

        return {
            width: '100%',
            backgroundColor: currentQuestionIndex === index
                ? '#1890ff'  // Blue for selected
                : isAnswered
                    ? '#e6f7ff'  // Light blue for answered
                    : '#fff',    // White for unanswered
            color: isSubmitted
                ? isCorrect
                    ? '#52c41a'  // Green text for correct
                    : '#ff4d4f'  // Red text for incorrect/unanswered
                : currentQuestionIndex === index
                    ? '#fff'     // White text for selected
                    : '#000',    // Black text for others
            borderColor: currentQuestionIndex === index
                ? '#1890ff'  // Blue border for selected
                : isAnswered
                    ? '#1890ff'  // Blue border for answered
                    : '#d9d9d9'  // Gray border for unanswered
        };
    };

    if (isLoading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" tip="Loading questions..."/>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Text>No questions available</Text>
            </div>
        );
    }

    return (
        <div style={{minHeight: '100vh', display: 'flex', padding: '24px', backgroundColor: '#f0f2f5'}}>
            {contextHolder}

            {/* Left Panel - Question Navigation */}
            <div style={{
                width: '25%',
                padding: '16px',
                borderRight: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                borderRadius: '8px',
                marginRight: '16px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                height: 'calc(100vh - 48px)' // Subtract padding from viewport height
            }}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <Space direction="vertical" style={{width: '100%'}} size={12}>
                        <Space style={{justifyContent: 'space-between', width: '100%'}}>
                            <Title level={5} style={{margin: 0}}>Questions</Title>
                            <Text>
                                <ClockCircleOutlined style={{marginRight: 8}}/>
                                {formatTime(timeLeft)}
                            </Text>
                        </Space>

                        <Progress
                            percent={Math.round((Object.keys(answers).length / TOTAL_QUESTIONS) * 100)}
                            status="active"
                            size="small"
                        />

                        <div style={{flex: 1, overflowY: 'auto'}}>
                            <Row gutter={[4, 4]}>
                                {questions.map((_, index) => (
                                    <Col span={4} key={index}>
                                        <Button
                                            key={index}
                                            size="small"
                                            type={currentQuestionIndex === index ? 'primary' : 'default'}
                                            style={getQuestionButtonStyle(index)}
                                            onClick={() => handleQuestionClick(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Space>
                </div>

                <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <Space style={{width: '100%', justifyContent: 'space-between'}}>
                        <Button onClick={handleExit}>Exit</Button>
                        <Button type="primary" onClick={handleSubmit}
                                disabled={isSubmitted}>Submit</Button>
                    </Space>
                </div>
            </div>

            {/* Right Panel - Current Question */}
            <div style={{
                width: '75%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
                <Space direction="vertical" style={{width: '100%', height: '100%'}} size={16}>
                    <div>
                        <Title level={4} style={{margin: 0, marginBottom: '8px'}}>{testName}</Title>
                        <Space style={{justifyContent: 'space-between', width: '100%'}}>
                            <Button
                                size="small"
                                icon={<LeftOutlined/>}
                                onClick={handlePrevQuestion}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>
                            <Text strong>Question {currentQuestionIndex + 1} of {questions.length}</Text>
                            <Button
                                size="small"
                                icon={<RightOutlined/>}
                                onClick={handleNextQuestion}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Next
                            </Button>
                        </Space>
                    </div>

                    <div style={{flex: 1, overflowY: 'auto'}}>
                        <QuestionCard
                            question={questions[currentQuestionIndex]}
                            index={currentQuestionIndex}
                            selectedAnswers={answers[currentQuestionIndex] || []}
                            onOptionChange={handleOptionChange}
                            isReviewMode={isSubmitted}
                        />
                    </div>
                </Space>
            </div>

            <Modal
                title="Submit Test"
                open={isSubmitConfirmVisible}
                onOk={handleConfirmSubmit}
                onCancel={() => setIsSubmitConfirmVisible(false)}
                okText="Yes"
                cancelText="No"
            >
                <p>Are you sure you want to submit your test?</p>
            </Modal>

            <Modal
                title="Exit Test"
                open={isExitConfirmVisible}
                onOk={handleConfirmExit}
                onCancel={() => setIsExitConfirmVisible(false)}
                okText="Yes"
                cancelText="No"
                okType="danger"
                okButtonProps={{danger: true}}
            >
                <Space>
                    <ExclamationCircleOutlined style={{color: '#faad14', fontSize: '24px'}}/>
                    <Text>Are you sure you want to exit? Your progress will be lost.</Text>
                </Space>
            </Modal>

            <Modal
                title="Test Results"
                open={isResultsModalVisible}
                onCancel={() => setIsResultsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsResultsModalVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                <div className="test-results">
                    {(() => {
                        const score = calculateScore();
                        return (
                            <Space direction="vertical" style={{width: '100%'}} size={16}>
                                <div style={{textAlign: 'center'}}>
                                    <Title level={2} style={{margin: 0}}>{score.percentage}%</Title>
                                    <Text type="secondary">
                                        {score.correct} correct out of {score.answered} answered questions
                                    </Text>
                                </div>
                                <Progress
                                    percent={score.percentage}
                                    status={score.percentage >= 70 ? 'success' : 'exception'}
                                />
                                <Space style={{justifyContent: 'center', width: '100%'}}>
                                    {score.percentage >= 70 ? (
                                        <Text type="success">
                                            <CheckCircleOutlined style={{marginRight: 8}}/>
                                            Passed
                                        </Text>
                                    ) : (
                                        <Text type="danger">
                                            <CloseCircleOutlined style={{marginRight: 8}}/>
                                            Failed
                                        </Text>
                                    )}
                                </Space>
                            </Space>
                        );
                    })()}
                </div>
            </Modal>
        </div>
    );
};

export default Test; 