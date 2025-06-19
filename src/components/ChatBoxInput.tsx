import React from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

// ChatBoxInput component renders the input field and send button for user messages
interface ChatBoxInputProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSendMessage: () => void;
  hasToken: boolean;
  isLoading: boolean;
}

const ChatBoxInput: React.FC<ChatBoxInputProps> = ({ inputValue, setInputValue, handleKeyPress, handleSendMessage, hasToken, isLoading }) => (
  <div
    style={{
      padding: '16px',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: 'white',
    }}
  >
    <Space.Compact style={{ width: '100%' }}>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={hasToken ? 'Type a message...' : 'API key required'}
        disabled={!hasToken || isLoading}
        style={{ borderRadius: '20px 0 0 20px' }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSendMessage}
        disabled={!hasToken || isLoading || !inputValue.trim()}
        style={{ borderRadius: '0 20px 20px 0' }}
      />
    </Space.Compact>
  </div>
);

export default ChatBoxInput; 