import { Layout, Menu, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upload');
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();

  useEffect(() => {
    // Get tab from URL path
    const path = location.pathname.slice(1) || 'upload';
    setActiveTab(path);
  }, [location]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    navigate(`/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: colorPrimary,
        padding: '0 24px',
      }}>
        <div style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: 'bold',
          marginRight: '48px',
        }}>
          Quizmo
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTab]}
          onClick={({ key }) => handleTabChange(key)}
          items={[
            {
              key: 'upload',
              icon: <QuestionCircleOutlined />,
              label: 'My Courses',
            },
          ]}
          style={{ 
            flex: 1,
            background: 'transparent',
            border: 'none',
          }}
        />
      </Header>
      <Content style={{ 
        margin: '24px 16px',
        padding: 24,
        background: colorBgContainer,
        borderRadius: 8,
      }}>
        {children}
      </Content>
    </Layout>
  );
}; 