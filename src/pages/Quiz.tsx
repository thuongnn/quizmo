import {Button, Card, Checkbox, Modal, Progress, Radio, Space, Tag, Typography} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    SoundOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {useSearchParams} from 'react-router-dom';
import {QUESTIONS_PER_TURN, useQuiz} from '../hooks/useQuiz';
import {getCourseById} from '../services/courseService';
import {useState} from 'react';

// Import sound files
import correctSound from '../assets/sounds/correct.mp3';
import incorrectSound from '../assets/sounds/incorrect.mp3';

const {Title, Text} = Typography;

const QuizPage = () => {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');
    const course = courseId ? getCourseById(courseId) : null;
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

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
        <div>
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
                        danger
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
                {currentQuestion.question}
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
                            <div style={getOptionTextStyle(key)}>
                                <span style={getOptionKeyStyle(key)}>
                                    {key}.
                                </span>
                                {text}
                            </div>
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
                        onClick={handleNext}
                        size="middle"
                        style={{minWidth: 100}}
                    >
                        {currentIndex < questions.length - 1 ? 'Next Question' : 'Next Turn'}
                    </Button>
                )}
            </div>

            <Modal
                open={currentIndex === questions.length - 1 && showResult}
                onOk={handleNext}
                onCancel={handleNext}
                footer={null}
                width={400}
            >
                <Space direction="vertical" style={{width: '100%'}} size="large">
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px'}}>
                        <div>
                            <Progress
                                type="circle"
                                percent={Math.round((learnedQuestions.length / totalQuestions.length) * 100)}
                                status="active"
                                strokeColor="#1890ff"
                                strokeWidth={12}
                                width={200}
                                format={() => (
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <div style={{fontSize: '36px', color: '#1890ff', fontWeight: 500}}>
                                            {learnedQuestions.length}/ {totalQuestions.length}
                                        </div>
                                        <div style={{fontSize: '14px', color: '#8c8c8c', marginTop: '2px'}}>
                                            Learned Questions
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {incorrectQuestions.length > 0 && (
                            <div style={{textAlign: 'center'}}>
                                <span style={{color: '#8c8c8c'}}>Questions to Review: </span>
                                <span style={{color: '#ff4d4f', fontWeight: 500}}>
                                    {incorrectQuestions.length}
                                </span>
                            </div>
                        )}
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
        </div>
    );
};

export default QuizPage; 