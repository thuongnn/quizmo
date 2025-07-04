import {Layout, Menu, theme} from 'antd';
import {FileTextOutlined, GithubOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import {useLocation, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import { useFlag } from '@unleash/proxy-client-react';

const {Header, Content, Footer} = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({children}: MainLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('upload');
    const isFooterEnabled = useFlag('is_footer');
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
                flex: 1,
            }}>
                {children}
            </Content>
            {isFooterEnabled && (
                <Footer style={{
                    textAlign: 'center',
                    background: colorBgContainer,
                    padding: '16px 50px',
                    borderTop: '1px solid #f0f0f0',
                }}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                        <span>© {new Date().getFullYear()} Quizmo - Developed by</span>
                        <a
                            href="https://github.com/thuongnn"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#1890ff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            thuongnn
                            <GithubOutlined/>
                        </a>
                    </div>
                </Footer>
            )}
        </Layout>
    );
}; 