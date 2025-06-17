import { Card, Typography, Space, Button, Popconfirm } from 'antd';
import { BookOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Course } from '../types/course';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface QuizCardProps {
  course: Course;
  onLearn: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

export const QuizCard = ({ course, onLearn, onDelete }: QuizCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <Space style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
      }}>
        <Popconfirm
          title="Delete Course"
          description="Are you sure you want to delete this course?"
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(course.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </Space>

      <Title level={4} style={{ marginBottom: 8 }}>{course.name}</Title>
      {course.description && (
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          {course.description}
        </Text>
      )}

      <Space direction="vertical" style={{ 
        marginTop: 'auto',
        width: '100%',
      }}>
        <Space style={{ 
          padding: '8px 0',
          borderTop: '1px solid #f0f0f0',
          width: '100%',
          justifyContent: 'space-between',
        }}>
          <Space>
            <Text type="secondary">Questions:</Text>
            <Text strong style={{ color: '#1890ff' }}>{course.questions.length}</Text>
          </Space>
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onLearn(course);
            }}
          >
            Learn
          </Button>
        </Space>
      </Space>
    </Card>
  );
}; 