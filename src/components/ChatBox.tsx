import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Card, Alert } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { callChatGPT, getChatGPTToken, getChatGPTModel } from '../services/chatgptService';
import type { ChatMessage } from '../services/chatgptService';
import ChatGPTSettings from './ChatGPTSettings';
import ChatBoxHeader from './ChatBoxHeader';
import ChatBoxMessages from './ChatBoxMessages';
import ChatBoxInput from './ChatBoxInput';
import { getQuizState, saveQuizState } from '../services/quizService';
import { CHATGPT_MAX_HISTORY } from '../constants/storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'ask-question';
}

interface ChatBoxProps {
  visible: boolean;
  onClose: () => void;
  currentQuestion?: { question: string; options: Record<string, string> };
  courseId: string;
}

const ChatBox = forwardRef<unknown, ChatBoxProps>(({ visible, onClose, currentQuestion, courseId }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (visible) {
      const token = getChatGPTToken();
      setHasToken(!!token);
      const quizState = getQuizState(courseId);
      const saved = quizState?.chatgptHistory;
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setMessages(saved.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
        return;
      }
      if (currentQuestion) {
        setMessages([
          {
            id: 'ask-question',
            text: 'Hỏi ChatGPT về câu hỏi này?',
            isUser: false,
            timestamp: new Date(),
            type: 'ask-question',
          },
        ]);
      } else {
        setMessages([]);
      }
    }
  }, [visible, hasToken, currentQuestion, courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const quizState = getQuizState(courseId);
      if (quizState) {
        saveQuizState(courseId, { ...quizState, chatgptHistory: messages });
      }
    }
  }, [messages, courseId]);

  useEffect(() => {
    if (visible) {
      setIsFullScreen(false);
    }
  }, [visible]);

  useImperativeHandle(ref, () => ({
    appendAskButton: () => {
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].type === 'ask-question') return prev;
        return [
          ...prev,
          {
            id: 'ask-question',
            text: 'Hỏi ChatGPT về câu hỏi này?',
            isUser: false,
            timestamp: new Date(),
            type: 'ask-question',
          },
        ];
      });
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAskCurrentQuestion = async () => {
    if (!hasToken) return;
    if (!currentQuestion || isLoading) return;
    const questionText = currentQuestion.question.replace(/<[^>]*>/g, '');
    const optionsText = Object.entries(currentQuestion.options)
      .map(([key, value]) => `${key}. ${value.replace(/<[^>]*>/g, '')}`)
      .join('\n');
    const plainTextQuestion = `Trả lời giúp tao câu hỏi sau:\n${questionText}\n${optionsText}`;
    // Hiển thị cho user
    const displayQuestion = plainTextQuestion.replace(/\n/g, '<br>');
    const autoMessage: Message = {
      id: Date.now().toString(),
      text: displayQuestion,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, autoMessage]);
    setIsLoading(true);
    try {
      const recentMessages = messages
        .filter(msg => msg.id !== '1')
        .slice(-CHATGPT_MAX_HISTORY)
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));
      const chatMessages: ChatMessage[] = [...recentMessages, { role: 'user', content: plainTextQuestion }];
      const response = await callChatGPT(chatMessages, getChatGPTModel());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gọi ChatGPT',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        if (!hasToken) {
          throw new Error('No ChatGPT token configured');
        }

        const recentMessages = messages
          .filter(msg => msg.id !== '1')
          .slice(-CHATGPT_MAX_HISTORY)
          .map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.text,
          }));

        const chatMessages: ChatMessage[] = [...recentMessages, { role: 'user', content: inputValue }];

        const response = await callChatGPT(chatMessages, getChatGPTModel());

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('ChatGPT Error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gọi ChatGPT',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTokenSet = () => {
    const token = getChatGPTToken();
    setHasToken(!!token);
    setMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].type === 'ask-question') return prev;
      return [
        ...prev,
        {
          id: 'ask-question',
          text: 'Hỏi ChatGPT về câu hỏi này?',
          isUser: false,
          timestamp: new Date(),
          type: 'ask-question',
        },
      ];
    });
  };

  const clearChatHistory = () => {
    const quizState = getQuizState(courseId);
    if (quizState) {
      saveQuizState(courseId, { ...quizState, chatgptHistory: [] });
    }
    if (currentQuestion) {
      setMessages([
        {
          id: 'ask-question',
          text: 'Hỏi ChatGPT về câu hỏi này?',
          isUser: false,
          timestamp: new Date(),
          type: 'ask-question',
        },
      ]);
    } else {
      setMessages([]);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div
        style={{
          position: isFullScreen ? 'fixed' : 'fixed',
          top: isFullScreen ? 0 : undefined,
          left: isFullScreen ? 0 : undefined,
          bottom: isFullScreen ? 0 : '100px',
          right: isFullScreen ? 0 : '20px',
          width: isFullScreen ? '100vw' : '400px',
          height: isFullScreen ? '100vh' : '550px',
          zIndex: 1000,
          boxShadow: isFullScreen ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: isFullScreen ? 0 : '12px',
          overflow: 'hidden',
          background: isFullScreen ? '#fff' : undefined,
          transition: 'all 0.3s',
        }}
      >
        <Card
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            borderRadius: isFullScreen ? 0 : '12px',
          }}
          bodyStyle={{
            padding: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <ChatBoxHeader
            isFullScreen={isFullScreen}
            setIsFullScreen={setIsFullScreen}
            setShowSettings={setShowSettings}
            handleClose={onClose}
            hasToken={hasToken}
            model={getChatGPTModel()}
          />

          {/* Token Alert */}
          {!hasToken && (
            <Alert
              message={<span style={{ fontSize: 13 }}>API Key Required</span>}
              description={<span style={{ fontSize: 12 }}>Click the settings <SettingOutlined style={{ fontSize: 13 }} /> to add ChatGPT API key</span>}
              type="info"
              showIcon={false}
              style={{ margin: '4px 8px 8px 8px', borderRadius: 4, padding: '6px 12px' }}
            />
          )}

          {/* Messages */}
          <ChatBoxMessages
            messages={messages}
            isLoading={isLoading}
            handleAskCurrentQuestion={handleAskCurrentQuestion}
            messagesEndRef={messagesEndRef}
          />

          {/* Input */}
          <ChatBoxInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
            hasToken={hasToken}
            isLoading={isLoading}
          />
        </Card>
      </div>

      {/* Settings Modal */}
      <ChatGPTSettings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onTokenSet={handleTokenSet}
        onClearHistory={clearChatHistory}
      />
    </>
  );
});

export default ChatBox; 