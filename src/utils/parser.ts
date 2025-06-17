import type { Question } from '../types/quiz';

export const parseQuestionText = (text: string): Omit<Question, 'answer'> => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const question = lines[0];
  const options: { [key: string]: string } = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([A-Z])[.)]\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      options[key] = value.trim();
    }
  }

  return {
    question,
    options,
  };
}; 