import {Layout, Menu, theme} from 'antd';
import {FileTextOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import {useLocation, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';

const {Header, Content} = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({children}: MainLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('upload');
    const {
        token: {colorBgContainer, colorPrimary},
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
        <Layout style={{minHeight: '100vh'}}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                background: colorPrimary,
                padding: '0 24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}>
                <div style={{
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginRight: '48px',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}>
                    Quizmo
                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[activeTab]}
                    onClick={({key}) => handleTabChange(key)}
                    items={[
                        {
                            key: 'upload',
                            icon: <QuestionCircleOutlined style={{fontSize: '18px'}}/>,
                            label: 'My Courses',
                        },
                        {
                            key: 'test',
                            icon: <FileTextOutlined style={{fontSize: '18px'}}/>,
                            label: 'Practice Test',
                        },
                    ]}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        fontSize: '16px',
                    }}
                    className="custom-menu"
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