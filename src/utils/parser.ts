import type { Question } from '../types/quiz';

export const parseQuestionText = (text: string): Omit<Question, 'answer'> => {
  // Find the first option (A, B, C, D) to separate question from options
  const firstOptionMatch = text.match(/\n([A-Z])[.)]\s/);
  if (!firstOptionMatch) {
    throw new Error('Invalid question format: No options found');
  }

  const firstOptionIndex = text.indexOf(firstOptionMatch[0]);
  
  // Split text into question and options parts
  const question = text.substring(0, firstOptionIndex).trim();
  const optionsText = text.substring(firstOptionIndex);
  
  // Parse options
  const options: { [key: string]: string } = {};
  const optionMatches = optionsText.matchAll(/([A-Z])[.)]\s*([^\n]+)/g);
  
  for (const match of optionMatches) {
    const [, key, value] = match;
    options[key] = value.trim();
  }

  return {
    question,
    options,
  };
}; 