import {Button, Card, Checkbox, Modal, Progress, Radio, Space, Tag, Typography} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    ReloadOutlined,
    SoundOutlined,
    WarningOutlined,
    MessageOutlined
} from '@ant-design/icons';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {QUESTIONS_PER_TURN, useQuiz} from '../hooks/useQuiz';
import {getCourseById} from '../services/courseService';
import {useState, useRef} from 'react';
import ChatBox from '../components/ChatBox';

// Import sound files
import correctSound from '../assets/sounds/correct.mp3';
import incorrectSound from '../assets/sounds/incorrect.mp3';

const {Title, Text} = Typography;

const QuizPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('courseId');
    const course = courseId ? getCourseById(courseId) : null;
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const chatBoxRef = useRef<any>(null);

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

    if (!courseId || !course) {
        return <div>Course not found</div>;
    }

    if (questions.length === 0) {
        return (
            <Card style={{margin: '24px auto', textAlign: 'center'}}>
                <Title level={3}>No Questions Available</Title>
                <Text>Please upload some questions to start the quiz.</Text>
            </Card>
        );
    }

    return (
        <div style={{minHeight: '100vh', display: 'flex', padding: '24px', backgroundColor: '#f0f2f5'}}>
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
                    icon={<CloseOutlined/>}
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        fontSize: '16px'
                    }}
                />
                <div style={{marginBottom: 24}}>
                    <Text style={{fontSize: 24, fontWeight: 500}}>{course.name}</Text>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                    <Progress
                        steps={{count: QUESTIONS_PER_TURN, gap: 4}}
                        percent={Math.round(((currentIndex + 1) / questions.length) * 100)}
                        format={() => `${currentIndex + 1} / ${questions.length}`}
                        status="active"
                        style={{flex: 1, marginRight: 16, width: "100%"}}
                        strokeWidth={10}
                    />
                    <Space>
                        <Button
                            icon={<SoundOutlined/>}
                            onClick={() => setIsMuted(!isMuted)}
                            type={isMuted ? 'default' : 'primary'}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </Button>
                        <Button
                            icon={<ReloadOutlined/>}
                            onClick={showResetModal}
                            size="middle"
                        >
                            Reset Quiz
                        </Button>
                    </Space>
                </div>

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
                    {isReviewQuestion && (
                        <Tag
                            color="warning"
                            style={{
                                position: 'absolute',
                                top: -12,
                                right: 16,
                                padding: '4px 8px',
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <WarningOutlined/>
                            Review Question
                        </Tag>
                    )}
                    <div dangerouslySetInnerHTML={{__html: currentQuestion.question}}/>
                </div>

                <Space direction="vertical" style={{width: '100%', gap: '8px'}}>
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
                                        style={{marginTop: 2}}
                                    />
                                ) : (
                                    <Radio
                                        checked={selectedAnswers.includes(key)}
                                        onChange={() => !showResult && handleOptionChange(key, true)}
                                        disabled={showResult}
                                        style={{marginTop: 2}}
                                    />
                                )}
                                <Text style={getOptionTextStyle(key)}>
                                    <Text strong style={getOptionKeyStyle(key)}>{key}.</Text>
                                    <span dangerouslySetInnerHTML={{__html: text}}/>
                                </Text>
                                {showResult && correctAnswers.includes(key) && (
                                    <CheckCircleOutlined style={getIconStyle(true)}/>
                                )}
                                {showResult && selectedAnswers.includes(key) && !correctAnswers.includes(key) && (
                                    <CloseCircleOutlined style={getIconStyle(false)}/>
                                )}
                            </div>
                        </div>
                    ))}
                </Space>

                <div style={{marginTop: 20, textAlign: 'center'}}>
                    {!showResult ? (
                        <Button
                            type="primary"
                            onClick={handleAnswer}
                            disabled={selectedAnswers.length === 0}
                            size="middle"
                            style={{minWidth: 100}}
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={handleNextWithChat}
                            size="middle"
                            style={{minWidth: 100}}
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Next Turn'}
                        </Button>
                    )}
                </div>

                <Modal
                    title="Are you ready to continue?"
                    open={currentIndex === questions.length - 1 && showResult}
                    onOk={handleNextWithChat}
                    onCancel={handleNextWithChat}
                    footer={[
                        <Button
                            key="continue"
                            type="primary"
                            size="large"
                            onClick={handleNextWithChat}
                        >
                            Continue
                        </Button>
                    ]}
                    width={450}
                    closable={false}
                >
                    <Space direction="vertical" style={{width: '100%'}} size="large">
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px'}}>
                            <div style={{width: '100%'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                    <span style={{color: '#8c8c8c'}}>Overall Progress</span>
                                    <span style={{color: '#8c8c8c'}}>{totalQuestions.length} questions</span>
                                </div>
                                <Progress
                                    percent={Math.round((learnedQuestions.length / totalQuestions.length) * 100)}
                                    status="active"
                                    strokeColor="#1890ff"
                                    strokeWidth={12}
                                />
                            </div>

                            <div style={{display: 'flex', gap: '16px', width: '100%'}}>
                                <Card style={{flex: 1, textAlign: 'center'}}>
                                    <div style={{fontSize: '24px', color: '#1890ff', fontWeight: 500}}>
                                        {learnedQuestions.length}
                                    </div>
                                    <div style={{fontSize: '14px', color: '#8c8c8c', marginTop: '4px'}}>
                                        Learned Questions
                                    </div>
                                </Card>
                                <Card style={{flex: 1, textAlign: 'center'}}>
                                    <div style={{fontSize: '24px', color: '#ff4d4f', fontWeight: 500}}>
                                        {incorrectQuestions.length}
                                    </div>
                                    <div style={{fontSize: '14px', color: '#8c8c8c', marginTop: '4px'}}>
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
                    okButtonProps={{danger: true}}
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
            </div>
        </div>
    );
};

export default QuizPage; 