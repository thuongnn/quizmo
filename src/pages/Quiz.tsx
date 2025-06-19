import { Button, Card, Checkbox, Modal, Progress, Radio, Space, Typography, Badge, Form, Input, message } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    ReloadOutlined,
    SoundOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { getCourseById } from '../services/courseService';
import { useState, useRef, useEffect } from 'react';
import ChatBox from '../components/ChatBox';

// Import sound files
import correctSound from '../assets/sounds/correct.mp3';
import incorrectSound from '../assets/sounds/incorrect.mp3';

const { Title, Text } = Typography;

const QuizPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('courseId');
    const course = courseId ? getCourseById(courseId) : null;
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [isTurnModalVisible, setIsTurnModalVisible] = useState(false);
    const [isInitialModal, setIsInitialModal] = useState(false);
    const [hasShownInitialModal, setHasShownInitialModal] = useState(false);
    const [answeredCount, setAnsweredCount] = useState(0);
    const chatBoxRef = useRef<any>(null);
    const [isUpdateAnswerModalVisible, setIsUpdateAnswerModalVisible] = useState(false);
    const [updateAnswerValue, setUpdateAnswerValue] = useState('');
    const [updateAnswerLoading, setUpdateAnswerLoading] = useState(false);
    const [form] = Form.useForm();

    const {
        questions,
        currentIndex,
        selectedAnswers,
        showResult,
        isMuted,
        setIsMuted,
        handleAnswer,
        handleNext,
        handleReset,
        handleOptionChange,
        incorrectQuestions,
        totalQuestions,
        learnedQuestions,
    } = useQuiz(courseId);

    // Create audio objects
    const correctAudio = new Audio(correctSound);
    const incorrectAudio = new Audio(incorrectSound);

    // Set volume
    correctAudio.volume = 0.5;
    incorrectAudio.volume = 0.5;

    const currentQuestion = questions[currentIndex];
    const correctAnswers = currentQuestion?.answer.split(',') || [];
    const isMultipleAnswer = correctAnswers.length > 1;
    const isReviewQuestion = incorrectQuestions.some(q => q.question === currentQuestion.question);

    const getOptionStyle = (key: string) => {
        const baseStyle = {
            width: '100%',
            padding: '12px 16px',
            borderRadius: 6,
            transition: 'all 0.3s ease',
            cursor: showResult ? 'default' : 'pointer',
            border: '1px solid',
            backgroundColor: 'white',
        };

        if (showResult) {
            if (correctAnswers.includes(key)) {
                return {
                    ...baseStyle,
                    borderColor: '#52c41a',
                    backgroundColor: '#f6ffed',
                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.15)',
                };
            }
            if (selectedAnswers.includes(key) && !correctAnswers.includes(key)) {
                return {
                    ...baseStyle,
                    borderColor: '#ff4d4f',
                    backgroundColor: '#fff2f0',
                    boxShadow: '0 2px 8px rgba(255, 77, 79, 0.15)',
                };
            }
            return {
                ...baseStyle,
                borderColor: '#d9d9d9',
                backgroundColor: 'white',
            };
        }

        if (selectedAnswers.includes(key)) {
            return {
                ...baseStyle,
                borderColor: '#1890ff',
                backgroundColor: '#e6f7ff',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
            };
        }

        return {
            ...baseStyle,
            borderColor: '#d9d9d9',
            backgroundColor: 'white',
            '&:hover': {
                borderColor: '#1890ff',
                backgroundColor: '#f5f5f5',
            },
        };
    };

    // @ts-ignore
    const getOptionContentStyle = (key: string) => ({
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        textAlign: 'left' as const,
        gap: '12px',
    });

    const getOptionTextStyle = (key: string) => ({
        flex: 1,
        color: showResult && correctAnswers.includes(key) ? '#52c41a' : undefined,
        fontWeight: showResult && correctAnswers.includes(key) ? 600 : undefined,
        textAlign: 'left' as const,
        fontSize: '15px',
        lineHeight: 1.6,
    });

    const getOptionKeyStyle = (key: string) => ({
        fontWeight: 'bold',
        marginRight: 8,
        color: showResult && correctAnswers.includes(key) ? '#52c41a' : undefined,
        fontSize: '15px',
    });

    const getIconStyle = (isCorrect: boolean) => ({
        color: isCorrect ? '#52c41a' : '#ff4d4f',
        marginLeft: 8,
        fontSize: '20px',
        flexShrink: 0,
    });

    const showResetModal = () => {
        setIsResetModalVisible(true);
    };

    const handleResetConfirm = () => {
        handleReset();
        setIsResetModalVisible(false);
    };

    const handleNextWithChat = () => {
        handleNext();
        setTimeout(() => {
            chatBoxRef.current?.appendAskButton();
        }, 0);
    };

    const getProgressPercent = () => {
        if (currentIndex === 0 && answeredCount === 0) return 1;
        return Math.round(((currentIndex + answeredCount + 1) / (questions.length * 2)) * 100);
    };

    // Show turn modal when finishing a turn
    useEffect(() => {
        if (currentIndex === questions.length - 1 && showResult) {
            setIsTurnModalVisible(true);
            setIsInitialModal(false);
        }
    }, [currentIndex, questions.length, showResult]);

    // Show modal on initial load if there is progress (after data loaded)
    useEffect(() => {
        if (
            !hasShownInitialModal &&
            (learnedQuestions.length > 0 || incorrectQuestions.length > 0) &&
            questions.length > 0 &&
            currentIndex === 0 &&
            !showResult
        ) {
            setIsTurnModalVisible(true);
            setIsInitialModal(true);
            setHasShownInitialModal(true);
        }
    }, [
        hasShownInitialModal,
        learnedQuestions.length,
        incorrectQuestions.length,
        questions.length,
        currentIndex,
        showResult,
    ]);

    const handleContinueTurnModal = () => {
        setIsTurnModalVisible(false);
        if (!isInitialModal) {
            handleNextWithChat();
        }
    };

    // Update answer handler
    const handleShowUpdateAnswerModal = () => {
        setUpdateAnswerValue(currentQuestion?.answer || '');
        setIsUpdateAnswerModalVisible(true);
    };
    const handleUpdateAnswer = async () => {
        setUpdateAnswerLoading(true);
        try {
            // 1. Update in 'courses' localStorage
            const courses = JSON.parse(localStorage.getItem('courses') || '[]');
            const courseIndex = courses.findIndex((c: any) => c.id === courseId);
            if (courseIndex !== -1) {
                courses[courseIndex].questions = courses[courseIndex].questions.map((q: any) =>
                    q.id === currentQuestion.id ? { ...q, answer: updateAnswerValue } : q
                );
                localStorage.setItem('courses', JSON.stringify(courses));
            }

            // 2. Update in quiz_state_{courseId}
            const quizStateKey = `quiz_state_${courseId}`;
            const quizState = JSON.parse(localStorage.getItem(quizStateKey) || '{}');
            if (quizState) {
                let changed = false;
                if (Array.isArray(quizState.learnedQuestions)) {
                    quizState.learnedQuestions = quizState.learnedQuestions.map((q: any) =>
                        q.id === currentQuestion.id ? { ...q, answer: updateAnswerValue } : q
                    );
                    changed = true;
                }
                if (Array.isArray(quizState.incorrectQuestions)) {
                    quizState.incorrectQuestions = quizState.incorrectQuestions.map((q: any) =>
                        q.id === currentQuestion.id ? { ...q, answer: updateAnswerValue } : q
                    );
                    changed = true;
                }
                if (changed) {
                    localStorage.setItem(quizStateKey, JSON.stringify(quizState));
                }
            }

            message.success('Cập nhật đáp án thành công!');
            setIsUpdateAnswerModalVisible(false);
            // Optional: reload page or update UI if needed
        } catch (e) {
            message.error('Có lỗi khi cập nhật đáp án!');
        } finally {
            setUpdateAnswerLoading(false);
        }
    };

    if (!courseId || !course) {
        return <div>Course not found</div>;
    }

    if (questions.length === 0) {
        return (
            <Card style={{ margin: '24px auto', textAlign: 'center' }}>
                <Title level={3}>No Questions Available</Title>
                <Text>Please upload some questions to start the quiz.</Text>
            </Card>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', padding: '24px', backgroundColor: '#f0f2f5' }}>
            <div style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                width: '100%'
            }}>
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        fontSize: '16px'
                    }}
                />
                <div style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 24, fontWeight: 500 }}>{course.name}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Progress
                        percent={getProgressPercent()}
                        showInfo={false}
                        style={{ flex: 1, marginRight: 16, width: "100%" }}
                        strokeWidth={10}
                    />
                    <Space>
                        <Button
                            icon={<SoundOutlined />}
                            onClick={() => setIsMuted(!isMuted)}
                            type={isMuted ? 'default' : 'primary'}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={showResetModal}
                            size="middle"
                        >
                            Reset Quiz
                        </Button>
                    </Space>
                </div>

                <Badge.Ribbon
                    color="#ffe8d8"
                    placement='start'
                    text={<span style={{ color: '#2e3856' }}>Try again</span>}
                    style={{ display: isReviewQuestion ? 'block' : 'none' }}
                >
                    <div
                        style={{
                            fontSize: 15,
                            marginBottom: 20,
                            whiteSpace: 'pre-line',
                            textAlign: 'left',
                            lineHeight: 1.5,
                            padding: '12px 16px',
                            backgroundColor: '#fafafa',
                            borderRadius: 6,
                            border: '1px solid #f0f0f0',
                            position: 'relative',
                        }}
                    >
                        {isReviewQuestion && <br/>}
                        <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
                    </div>
                </Badge.Ribbon>

                <Space direction="vertical" style={{ width: '100%', gap: '8px' }}>
                    {Object.entries(currentQuestion?.options || {}).map(([key, text]) => (
                        <div
                            key={key}
                            style={getOptionStyle(key)}
                            onClick={() => !showResult && handleOptionChange(key, !selectedAnswers.includes(key))}
                        >
                            <div style={getOptionContentStyle(key)}>
                                {isMultipleAnswer ? (
                                    <Checkbox
                                        checked={selectedAnswers.includes(key)}
                                        onChange={(e) => !showResult && handleOptionChange(key, e.target.checked)}
                                        disabled={showResult}
                                        style={{ marginTop: 2 }}
                                    />
                                ) : (
                                    <Radio
                                        checked={selectedAnswers.includes(key)}
                                        onChange={() => !showResult && handleOptionChange(key, true)}
                                        disabled={showResult}
                                        style={{ marginTop: 2 }}
                                    />
                                )}
                                <Text style={getOptionTextStyle(key)}>
                                    <Text strong style={getOptionKeyStyle(key)}>{key}.</Text>
                                    <span dangerouslySetInnerHTML={{ __html: text }} />
                                </Text>
                                {showResult && correctAnswers.includes(key) && (
                                    <CheckCircleOutlined style={getIconStyle(true)} />
                                )}
                                {showResult && selectedAnswers.includes(key) && !correctAnswers.includes(key) && (
                                    <CloseCircleOutlined style={getIconStyle(false)} />
                                )}
                            </div>
                        </div>
                    ))}
                </Space>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Button
                        type="default"
                        onClick={handleShowUpdateAnswerModal}
                        style={{marginBottom: 12, marginRight: 8}}
                    >
                        Cập nhật đáp án
                    </Button>
                    {!showResult ? (
                        <Button
                            type="primary"
                            onClick={() => {
                                handleAnswer();
                                setAnsweredCount((prev) => prev + 1);
                            }}
                            disabled={selectedAnswers.length === 0}
                            size="middle"
                            style={{ minWidth: 100 }}
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={handleNextWithChat}
                            size="middle"
                            style={{ minWidth: 100 }}
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Next Turn'}
                        </Button>
                    )}
                </div>

                <Modal
                    title="Are you ready to continue?"
                    open={isTurnModalVisible}
                    footer={[
                        <Button
                            key="continue"
                            type="primary"
                            size="large"
                            onClick={() => {
                                handleContinueTurnModal();
                                setAnsweredCount(0);
                            }}
                        >
                            Continue
                        </Button>
                    ]}
                    closable={false}
                    width={450}
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#8c8c8c' }}>Overall Progress</span>
                                    <span style={{ color: '#8c8c8c' }}>{totalQuestions.length} questions</span>
                                </div>
                                <Progress
                                    percent={Math.round((learnedQuestions.length / totalQuestions.length) * 100)}
                                    status="active"
                                    strokeColor="#1890ff"
                                    strokeWidth={12}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                                <Card style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#1890ff', fontWeight: 500 }}>
                                        {learnedQuestions.length}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                                        Learned Questions
                                    </div>
                                </Card>
                                <Card style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#ff4d4f', fontWeight: 500 }}>
                                        {incorrectQuestions.length}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                                        Questions to Review
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Space>
                </Modal>

                {/* Reset Confirmation Modal */}
                <Modal
                    title="Reset Quiz"
                    open={isResetModalVisible}
                    onOk={handleResetConfirm}
                    onCancel={() => setIsResetModalVisible(false)}
                    okText="Reset"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <p>Are you sure you want to reset the quiz? This will clear all your progress and start from the
                        beginning.</p>
                </Modal>

                {/* Float Chat Button */}
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={() => setIsChatVisible(!isChatVisible)}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '60px',
                        height: '60px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 999,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                    }}
                />

                {/* Chat Box */}
                <ChatBox
                    ref={chatBoxRef}
                    visible={isChatVisible}
                    onClose={() => setIsChatVisible(false)}
                    currentQuestion={currentQuestion ? {
                        question: currentQuestion.question,
                        options: currentQuestion.options
                    } : undefined}
                    courseId={courseId}
                />

                <Modal
                    title={`Cập nhật đáp án cho câu hỏi`}
                    open={isUpdateAnswerModalVisible}
                    onOk={handleUpdateAnswer}
                    onCancel={() => setIsUpdateAnswerModalVisible(false)}
                    confirmLoading={updateAnswerLoading}
                    okText="Cập nhật"
                    cancelText="Hủy"
                >
                    <Form form={form} layout="vertical">
                        <Form.Item label="Đáp án mới" required>
                            <Input
                                value={updateAnswerValue}
                                onChange={e => setUpdateAnswerValue(e.target.value)}
                                placeholder="Nhập đáp án mới (ví dụ: A hoặc A,B)"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default QuizPage; 