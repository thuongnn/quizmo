import React from 'react';
import { Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import AIContentRenderer from './AIContentRenderer';

const { Text } = Typography;

// ChatBoxMessages component renders the list of chat messages and the loading indicator
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'ask-question';
}

interface ChatBoxMessagesProps {
  messages: Message[];
  isLoading: boolean;
  handleAskCurrentQuestion: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatBoxMessages: React.FC<ChatBoxMessagesProps> = ({ messages, isLoading, handleAskCurrentQuestion, messagesEndRef }) => (
  <div
    style={{
      flex: 1,
      padding: '16px',
      overflowY: 'auto',
      backgroundColor: '#f8f9fa',
    }}
  >
    {/* Render each message bubble */}
    {messages.map((message) => {
      if (message.type === 'ask-question') {
        return (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '12px',
            }}
          >
            <div
              onClick={handleAskCurrentQuestion}
              style={{
                maxWidth: '80%',
                padding: '8px 16px',
                borderRadius: '18px',
                background: '#f6f8fa',
                color: '#1677ff',
                fontWeight: 500,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #e0e3e8',
                userSelect: 'none',
                transition: 'background 0.2s',
              }}
              title="Click to ask ChatGPT about this question"
            >
              <QuestionCircleOutlined style={{ fontSize: 18, color: '#1677ff' }} />
              {message.text}
            </div>
          </div>
        );
      }
      return (
        <div
          key={message.id}
          style={{
            display: 'flex',
            justifyContent: message.isUser ? 'flex-end' : 'flex-start',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '18px',
              backgroundColor: message.isUser ? '#1890ff' : 'white',
              color: message.isUser ? 'white' : '#333',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              wordWrap: 'break-word',
            }}
          >
            <Text style={{ color: message.isUser ? 'white' : '#333' }}>
              {message.isUser ? (
                <span dangerouslySetInnerHTML={{ __html: message.text }} />
              ) : (
                <AIContentRenderer content={message.text} />
              )}
            </Text>
            <div
              style={{
                fontSize: '10px',
                color: message.isUser ? 'rgba(255, 255, 255, 0.7)' : '#999',
                marginTop: '4px',
                textAlign: message.isUser ? 'right' : 'left',
              }}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      );
    })}
    {/* Loading indicator */}
    {isLoading && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            minHeight: 32,
          }}
        >
          <div className="dot-stretching" />
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatBoxMessages; 