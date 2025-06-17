import type {Question} from '../types/quiz';

export function parseQuestionText(text: string): Question {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    // Find where the options start by looking for the first line that matches the option pattern
    const optionStartIndex = lines.findIndex(line => /^[A-Z][.)]\s*/.test(line));

    // If no options found, treat the entire text as question
    if (optionStartIndex === -1) {
        return {
            id: crypto.randomUUID(),
            question: text,
            options: {} as Record<string, string>,
            answer: '',
            explanation: ''
        };
    }

    // Join all lines before the first option as the question text, preserving HTML
    const questionText = lines.slice(0, optionStartIndex).join('\n');

    // Get all lines after the question as options text
    const optionsText = lines.slice(optionStartIndex).join('\n');

    const options: Record<string, string> = {};
    // Split the text by option markers (A., B., etc.)
    const optionParts = optionsText.split(/(?=^[A-Z][.)]\s*)/m);

    // Process each option part
    for (const part of optionParts) {
        if (!part.trim()) continue;

        // Extract the option letter and content
        const match = part.match(/^([A-Z])[.)]\s*(.*)/s);
        if (match) {
            const [, letter, content] = match;
            options[letter] = content.trim();
        }
    }

    return {
        id: crypto.randomUUID(),
        question: questionText,
        options,
        answer: Object.keys(options)[0], // Assuming first option is correct
        explanation: ''
    };
} 