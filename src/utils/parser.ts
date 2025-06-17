import type {Question} from '../types/quiz';

export function parseQuestionText(text: string): Question {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const questionText = lines[0];
    const optionsText = lines.slice(1).join('\n');

    const options: string[] = [];
    const optionMatches = optionsText.matchAll(/([A-Z])[.)]\s*([^\n]+)/g);

    for (const match of optionMatches) {
        const [, , value] = match;
        options.push(value.trim());
    }

    return {
        id: crypto.randomUUID(),
        question: questionText,
        options,
        answer: options[0], // Assuming first option is correct
        explanation: ''
    };
} 