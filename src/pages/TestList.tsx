import {Button, Card, Col, Row, Space, Typography} from 'antd';
import {FileTextOutlined} from '@ant-design/icons';
import {getCourses} from '../services/courseService';

const {Title, Text} = Typography;

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
                                style={{height: '100%', display: 'flex', flexDirection: 'column'}}
                            >
                                <Space direction="vertical" style={{width: '100%'}} size={8}>
                                    <Title level={4} style={{margin: 0}}>{course.name}</Title>
                                    {course.description && (
                                        <Text type="secondary" style={{marginBottom: 16, display: 'block'}}>
                                            {course.description}
                                        </Text>
                                    )}
                                    <div style={{marginTop: 'auto'}}>
                                        <Space style={{justifyContent: 'space-between', width: '100%'}}>
                                            <Text type="secondary">
                                                {course.questions.length} questions available
                                            </Text>
                                            <Button
                                                type="primary"
                                                icon={<FileTextOutlined/>}
                                                onClick={() => handleStartTest(course.id)}
                                                disabled={course.questions.length < 65}
                                            >
                                                Start Test
                                            </Button>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Space>
        </div>
    );
};

export default TestList; 