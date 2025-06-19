import React from 'react';
import { Avatar, Space, Typography, Button, Tooltip } from 'antd';
import { MessageOutlined, FullscreenOutlined, FullscreenExitOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

// ChatBoxHeader component renders the top bar of the chat box, including title, status, and action buttons
interface ChatBoxHeaderProps {
  isFullScreen: boolean;
  setIsFullScreen: (f: (v: boolean) => boolean) => void;
  setShowSettings: (v: boolean) => void;
  handleClose: () => void;
  hasToken: boolean;
  model: string;
}

const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({ isFullScreen, setIsFullScreen, setShowSettings, handleClose, hasToken, model }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Space>
      <Avatar style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} icon={<MessageOutlined />} />
      <div>
        <Text strong style={{ color: 'white' }}>AI Assistant</Text>
        <br />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
          {!hasToken ? (
            'Setup Required'
          ) : (
            model && (
              <span style={{ fontWeight: 400 }}>
                Model: <span style={{ fontFamily: 'monospace' }}>{model}</span>
              </span>
            )
          )}
        </Text>
      </div>
    </Space>
    <Space>
      <Tooltip title={isFullScreen ? 'Minimize' : 'Fullscreen'}>
        <Button
          type="text"
          icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={() => setIsFullScreen(f => !f)}
          style={{ color: 'white' }}
        />
      </Tooltip>
      <Tooltip title="API Key Settings">
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => setShowSettings(true)}
          style={{ color: 'white' }}
        />
      </Tooltip>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={handleClose}
        style={{ color: 'white' }}
      />
    </Space>
  </div>
);

export default ChatBoxHeader; 