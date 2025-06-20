import {Button, Card, Modal, Space, Typography} from 'antd';
import {BookOutlined, DeleteOutlined, ExclamationCircleOutlined, DownloadOutlined} from '@ant-design/icons';
import type {Course} from '../types/course';
import {useState} from 'react';

const {Text, Paragraph} = Typography;

interface QuizCardProps {
    course: Course;
    onLearn: (course: Course) => void;
    onDelete: (courseId: string) => void;
}

export const QuizCard = ({course, onLearn, onDelete}: QuizCardProps) => {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const showDeleteModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalVisible(true);
    };

    const handleDelete = () => {
        onDelete(course.id);
        setIsDeleteModalVisible(false);
    };

    // Download course as JSON
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Transform questions to the required format
        const formattedQuestions = course?.questions?.map(q => {
            // Combine question and options into one string
            const optionsText = Object.entries(q.options || {})
                .map(([key, value]) => `${key}. ${value}`)
                .join('\n');
            
            const questionText = `${q.question}\n${optionsText}`;
            
            return {
                question: questionText,
                answer: q.answer
            };
        }) || [];
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formattedQuestions, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${course.name || 'course'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
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
            <Space style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
            }}>
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined/>}
                    onClick={showDeleteModal}
                />
            </Space>

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
                    <Space>
                        <Button
                            icon={<DownloadOutlined/>}
                            onClick={handleDownload}
                        />
                        <Button
                            type="primary"
                            icon={<BookOutlined/>}
                            onClick={(e) => {
                                e.stopPropagation();
                                onLearn(course);
                            }}
                        >
                            Learn
                        </Button>
                    </Space>
                </Space>
            </div>

            <Modal
                title="Delete Course"
                open={isDeleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                cancelText="Cancel"
                okType="danger"
                okButtonProps={{danger: true}}
            >
                <Space>
                    <ExclamationCircleOutlined style={{color: '#faad14', fontSize: '24px'}}/>
                    <Text>Are you sure you want to delete this course? This action cannot be undone.</Text>
                </Space>
            </Modal>
        </Card>
    );
}; 