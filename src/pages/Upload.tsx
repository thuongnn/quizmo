import {useState} from 'react';
import {Button, Card, Col, Form, Input, message, Modal, Row, Typography, Upload} from 'antd';
import {PlusOutlined, UploadOutlined} from '@ant-design/icons';
import type {UploadFile} from 'antd/es/upload/interface';
import {useNavigate} from 'react-router-dom';
import {QuizCard} from '../components/QuizCard';
import {deleteCourse, getCourses} from '../services/courseService';
import {saveCourse} from '../utils/storage';
import type {Course} from '../types/course';
import {parseQuestionText} from '../utils/parser';

const {Title} = Typography;
const {TextArea} = Input;

const UploadPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [courses, setCourses] = useState<Course[]>(getCourses());
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleCancel = () => {
        setIsModalOpen(false);
        setFileList([]);
        form.resetFields();
    };

    const handleUpload = async () => {
        try {
            const values = await form.validateFields();
            const file = fileList[0];
            const text = await file.originFileObj?.text();
            if (!text) {
                throw new Error('Failed to read file');
            }

            const rawQuestions = JSON.parse(text);

            // Validate input format
            if (!Array.isArray(rawQuestions) || !rawQuestions.every(q =>
                typeof q.question === 'string' &&
                typeof q.answer === 'string'
            )) {
                throw new Error('Invalid questions format');
            }

            // Parse each question
            const questions = rawQuestions.map(q => {
                const parsed = parseQuestionText(q.question);
                return {
                    ...parsed,
                    answer: q.answer
                };
            });

            const newCourse = saveCourse({
                name: values.title,
                description: values.description,
                questions,
                createdAt: Date.now()
            });

            setCourses(prev => [...prev, newCourse]);
            message.success('Course uploaded successfully');
            handleCancel();
        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Failed to upload course');
        }
    };

    const handleLearn = (course: Course) => {
        navigate(`/quiz?courseId=${course.id}`);
    };

    const handleDelete = (courseId: string) => {
        deleteCourse(courseId);
        setCourses(prev => prev.filter(course => course.id !== courseId));
        message.success('Course deleted successfully');
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <Title level={3} style={{margin: 0}}>My Courses</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    onClick={() => setIsModalOpen(true)}
                >
                    Upload New Course
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {courses.map(course => (
                    <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                        <QuizCard
                            course={course}
                            onLearn={handleLearn}
                            onDelete={handleDelete}
                        />
                    </Col>
                ))}
            </Row>

            {/* Upload Modal */}
            <Modal
                title="Upload New Course"
                open={isModalOpen}
                onOk={handleUpload}
                onCancel={handleCancel}
                okText="Upload"
                cancelText="Cancel"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={true}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{required: true, message: 'Please enter course title'}]}
                    >
                        <Input
                            placeholder="Enter course title"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{required: true, message: 'Please enter course description'}]}
                    >
                        <TextArea
                            placeholder="Enter course description"
                            rows={4}
                            style={{resize: 'none'}}
                        />
                    </Form.Item>

                    <Form.Item
                        name="file"
                        label="Questions File"
                        rules={[{required: true, message: 'Please upload a JSON file'}]}
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) {
                                return e;
                            }
                            return e?.fileList;
                        }}
                    >
                        <Upload
                            accept=".json"
                            maxCount={1}
                            fileList={fileList}
                            onChange={({fileList}) => setFileList(fileList)}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined/>} size="large" block>
                                Select JSON File
                            </Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UploadPage; 