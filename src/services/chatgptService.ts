import { CHATGPT_CONFIG_KEY, CHATGPT_DEFAULT_MAX_TOKENS, CHATGPT_DEFAULT_SYSTEM_PROMPT, CHATGPT_DEFAULT_SYSTEM_ROLE } from '../constants/storage';

const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Unified config getter
export function getChatGPTConfig() {
  const raw = localStorage.getItem(CHATGPT_CONFIG_KEY);
  if (!raw) return {
    token: '',
    model: 'gpt-4o',
    max_tokens: CHATGPT_DEFAULT_MAX_TOKENS,
    system_prompt: CHATGPT_DEFAULT_SYSTEM_PROMPT,
    system_role: CHATGPT_DEFAULT_SYSTEM_ROLE,
  };
  try {
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || '',
      model: parsed.model || 'gpt-4o',
      max_tokens: parsed.max_tokens || CHATGPT_DEFAULT_MAX_TOKENS,
      system_prompt: parsed.system_prompt || CHATGPT_DEFAULT_SYSTEM_PROMPT,
      system_role: parsed.system_role || CHATGPT_DEFAULT_SYSTEM_ROLE,
    };
  } catch {
    return {
      token: '',
      model: 'gpt-4o',
      max_tokens: CHATGPT_DEFAULT_MAX_TOKENS,
      system_prompt: CHATGPT_DEFAULT_SYSTEM_PROMPT,
      system_role: CHATGPT_DEFAULT_SYSTEM_ROLE,
    };
  }
}

export function getChatGPTToken(): string | null {
  return getChatGPTConfig().token || null;
}

export function getChatGPTModel(): string {
  return getChatGPTConfig().model || 'gpt-4o';
}

export async function callChatGPT(
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  const config = getChatGPTConfig();
  const token = config.token;
  if (!token) throw new Error('No ChatGPT token configured');
  const usedModel = model || config.model || 'gpt-4o';
  // Always prepend system prompt
  const fullMessages: ChatMessage[] = [
    {
      role: config.system_role,
      content: config.system_prompt,
    },
    ...messages,
  ];
  const response = await fetch(CHATGPT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: usedModel,
      messages: fullMessages,
      max_tokens: config.max_tokens,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to call ChatGPT');
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
} 