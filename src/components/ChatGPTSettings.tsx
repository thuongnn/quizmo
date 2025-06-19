import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Space, Typography, Card, Select, Tabs, message } from 'antd';
import { KeyOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, HistoryOutlined, SettingOutlined, ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { CHATGPT_CONFIG_KEY, CHATGPT_DEFAULT_MAX_TOKENS, CHATGPT_DEFAULT_SYSTEM_PROMPT, CHATGPT_DEFAULT_SYSTEM_ROLE } from '../constants/storage';

const CHATGPT_DEFAULT_MODEL = 'gpt-4o';

const { Text } = Typography;

interface ChatGPTSettingsProps {
  visible: boolean;
  onClose: () => void;
  onTokenSet: () => void;
  onClearHistory?: () => void;
}

const ChatGPTSettings: React.FC<ChatGPTSettingsProps> = ({ visible, onClose, onTokenSet, onClearHistory }) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'api' | 'behavior'>('api');
  const [model, setModel] = useState<string>(CHATGPT_DEFAULT_MODEL);

  // ChatGPT config state
  const [maxTokens, setMaxTokens] = useState<number>(CHATGPT_DEFAULT_MAX_TOKENS);
  const [systemPrompt, setSystemPrompt] = useState<string>(CHATGPT_DEFAULT_SYSTEM_PROMPT);
  const [systemRole, setSystemRole] = useState<string>(CHATGPT_DEFAULT_SYSTEM_ROLE);

  useEffect(() => {
    if (visible) {
      setActiveTab('api');
      // Load config from one place
      const raw = localStorage.getItem(CHATGPT_CONFIG_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setCurrentToken(parsed.token || '');
          setToken(parsed.token || '');
          setModel(parsed.model || CHATGPT_DEFAULT_MODEL);
          setMaxTokens(parsed.max_tokens || CHATGPT_DEFAULT_MAX_TOKENS);
          setSystemPrompt(parsed.system_prompt || CHATGPT_DEFAULT_SYSTEM_PROMPT);
          setSystemRole(parsed.system_role || CHATGPT_DEFAULT_SYSTEM_ROLE);
        } catch {}
      } else {
        setCurrentToken('');
        setToken('');
        setModel(CHATGPT_DEFAULT_MODEL);
        setMaxTokens(CHATGPT_DEFAULT_MAX_TOKENS);
        setSystemPrompt(CHATGPT_DEFAULT_SYSTEM_PROMPT);
        setSystemRole(CHATGPT_DEFAULT_SYSTEM_ROLE);
      }
    }
  }, [visible]);

  const handleSaveToken = async () => {
    if (!token.trim()) {
      return;
    }
    setLoading(true);
    try {
      // Verify token bằng cách gọi API models
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      });
      if (!res.ok) {
        throw new Error('Invalid token!');
      }
      // Save all config to one key
      localStorage.setItem(
        CHATGPT_CONFIG_KEY,
        JSON.stringify({
          token: token.trim(),
          model,
          max_tokens: maxTokens,
          system_prompt: systemPrompt,
          system_role: systemRole,
        })
      );
      setCurrentToken(token.trim());
      onTokenSet();
      message.success('Token updated successfully!');
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Invalid token!');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveToken = () => {
    // Remove token from config
    const raw = localStorage.getItem(CHATGPT_CONFIG_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        delete parsed.token;
        localStorage.setItem(CHATGPT_CONFIG_KEY, JSON.stringify(parsed));
      } catch {}
    }
    setToken('');
    setCurrentToken('');
    onTokenSet();
  };

  const handleClose = () => {
    setToken('');
    setShowToken(false);
    onClose();
  };

  // Save config to localStorage
  const handleSaveConfig = () => {
    // Save all config to one key
    const raw = localStorage.getItem(CHATGPT_CONFIG_KEY);
    let prev: any = {};
    if (raw) {
      try {
        prev = JSON.parse(raw);
      } catch {}
    }
    localStorage.setItem(
      CHATGPT_CONFIG_KEY,
      JSON.stringify({
        ...prev,
        model,
        max_tokens: maxTokens,
        system_prompt: systemPrompt,
        system_role: systemRole,
      })
    );
    onClose();
  };

  // Save action tuỳ theo tab
  const handleSave = () => {
    if (activeTab === 'api') {
      handleSaveToken();
    } else if (activeTab === 'behavior') {
      handleSaveConfig();
    }
  };

  return (
    <Modal
      title={<Space><SettingOutlined />ChatGPT Settings</Space>}
      open={visible}
      onCancel={handleClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            icon={<HistoryOutlined />}
            danger
            onClick={onClearHistory}
          >
            Clear Chat History
          </Button>
          <Space>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              disabled={activeTab === 'api' ? !token.trim() : false}
            >
              Save
            </Button>
          </Space>
        </div>
      }
      width={600}
    >
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as 'api' | 'behavior')}
        items={[
          {
            key: 'api',
            label: <span><ApiOutlined /> API Key & Model</span>,
            children: (
              <Card size="small" style={{ background: '#fafbfc', borderRadius: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Text strong style={{ fontSize: 15 }}>API Key</Text>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>
                    <div>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></div>
                    <div>2. Create a new API key</div>
                    <div>3. Copy and paste it into the field below</div>
                  </div>
                  {currentToken ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 }}>
                      <span style={{
                        background: '#e6f7ff',
                        color: '#1890ff',
                        borderRadius: 12,
                        padding: '2px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 500,
                        fontSize: 13,
                        lineHeight: 1.6
                      }}>
                        <CheckCircleOutlined style={{ color: '#1890ff', marginRight: 6, fontSize: 16, verticalAlign: 'middle' }} />
                        Token is set
                      </span>
                      <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                        onClick={handleRemoveToken}
                        size="small"
                      />
                    </div>
                  ) : (
                    <Input.Password
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="sk-..."
                      prefix={<KeyOutlined />}
                      suffix={
                        <Button
                          type="text"
                          icon={showToken ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          onClick={() => setShowToken(!showToken)}
                        />
                      }
                      visibilityToggle={false}
                      style={{ fontFamily: 'monospace' }}
                    />
                  )}
                  <div>
                    <Text strong style={{ fontSize: 15 }}>Model</Text>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
                      Choose the OpenAI model for chat
                    </div>
                    <Select
                      value={model}
                      onChange={setModel}
                      style={{ width: '100%' }}
                      options={[
                        { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
                        { value: 'gpt-4o', label: 'gpt-4o' },
                      ]}
                    />
                  </div>
                </Space>
              </Card>
            ),
          },
          {
            key: 'behavior',
            label: <span><SettingOutlined /> Chat Behavior</span>,
            children: (
              <Card size="small" style={{ background: '#fafbfc', borderRadius: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <Text strong>Max tokens</Text>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
                      Limit the maximum length of AI response (50-4096, default: 500)
                    </div>
                    <Input
                      type="number"
                      min={50}
                      max={4096}
                      value={maxTokens}
                      onChange={e => setMaxTokens(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <Text strong>System role</Text>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
                      Role for system prompt (usually "system")
                    </div>
                    <Select
                      value={systemRole}
                      style={{ width: 180 }}
                      onChange={setSystemRole}
                      options={[
                        { value: 'system', label: 'system' },
                        { value: 'user', label: 'user' },
                        { value: 'assistant', label: 'assistant' },
                      ]}
                    />
                  </div>
                  <div>
                    <Text strong>System prompt</Text>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
                      Instructions for AI behavior and answer format
                    </div>
                    <Input.TextArea
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      autoSize={{ minRows: 4, maxRows: 10 }}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </Space>
              </Card>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ChatGPTSettings; 