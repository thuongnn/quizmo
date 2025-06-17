import {Button, Card, Col, Row, Space, Typography} from 'antd';
import {BookOutlined} from '@ant-design/icons';
import {getCourses} from '../services/courseService';

const {Title, Text, Paragraph} = Typography;

const TestList = () => {
    const courses = getCourses();

    const handleStartTest = (courseId: string) => {
        window.open(`/test/exam?courseId=${courseId}`, '_blank');
    };

    return (
        <div>
            <Space direction="vertical" style={{width: '100%'}} size={16}>
                <Title level={3}>Available Tests</Title>
                <Text type="secondary">
                    Select a course to start a practice test. Each test consists of 65 questions with a 2-hour time
                    limit.
                </Text>

                <Row gutter={[24, 24]}>
                    {courses.map(course => (
                        <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                            <Card
                                hoverable
                                style={{
                                    height: '230px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                }}
                                bodyStyle={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    padding: '16px',
                                }}
                            >
                                <div style={{flex: 1}}>
                                    <Paragraph
                                        ellipsis={{rows: 2}}
                                        style={{
                                            marginBottom: 8,
                                            fontSize: '18px',
                                            fontWeight: 600,
                                            lineHeight: '1.4',
                                        }}
                                    >
                                        {course.name}
                                    </Paragraph>
                                    {course.description && (
                                        <Paragraph
                                            type="secondary"
                                            ellipsis={{rows: 3}}
                                            style={{
                                                height: '65px',
                                                marginBottom: 0,
                                                lineHeight: '1.4',
                                            }}
                                        >
                                            {course.description}
                                        </Paragraph>
                                    )}
                                </div>

                                <div style={{
                                    marginTop: 'auto',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #f0f0f0',
                                }}>
                                    <Space style={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                    }}>
                                        <Space>
                                            <Text type="secondary">Questions:</Text>
                                            <Text strong style={{color: '#1890ff'}}>{course.questions.length}</Text>
                                        </Space>
                                        <Button
                                            type="primary"
                                            icon={<BookOutlined/>}
                                            onClick={() => handleStartTest(course.id)}
                                            disabled={course.questions.length < 65}
                                        >
                                            Start Test
                                        </Button>
                                    </Space>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Space>
        </div>
    );
};

export default TestList; 