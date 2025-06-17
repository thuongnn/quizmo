import {Button, Card, Checkbox, Progress, Radio, Space, Typography} from 'antd';
import {CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, SoundOutlined} from '@ant-design/icons';
import {useSearchParams} from 'react-router-dom';
import {useQuiz} from '../hooks/useQuiz';

// Import sound files
import correctSound from '../assets/sounds/correct.mp3';
import incorrectSound from '../assets/sounds/incorrect.mp3';

const {Title, Text} = Typography;

const QuizPage = () => {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');

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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <Progress
                    percent={Math.round(((currentIndex + 1) / questions.length) * 100)}
                    status="active"
                    style={{flex: 1, marginRight: 16}}
                    strokeWidth={8}
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
                        onClick={handleReset}
                        danger
                        size="middle"
                    >
                        Reset Quiz
                    </Button>
                </Space>
            </div>

            <Title level={4} style={{marginBottom: 16}}>Question {currentIndex + 1} of {questions.length}</Title>
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
                }}
            >
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
                        {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default QuizPage; 