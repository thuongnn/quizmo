export const STORAGE_KEYS = {
    COURSES: 'courses',
    QUIZ_STATE: 'quiz_state',
    COURSE_PROGRESS: 'courseProgress',
    TESTING_OPTIONS: 'testing_options',
    TEST_SEEN_QUESTIONS: 'test_seen_questions',
    TEST_WRONG_QUESTIONS: 'test_wrong_questions',
} as const;

export const CHATGPT_HISTORY_KEY = 'chatgpt_history';
export const CHATGPT_MAX_HISTORY = 30;
export const CHATGPT_CONFIG_KEY = 'chatgpt_config';
export const CHATGPT_DEFAULT_MAX_TOKENS = 500;
export const CHATGPT_DEFAULT_SYSTEM_ROLE = 'system';
export const CHATGPT_DEFAULT_SYSTEM_PROMPT = 'Bạn là chuyên gia AWS, chuyên giải thích các câu hỏi trắc nghiệm về AWS cho DevOps, Developer, IT Ops, System Engineer, Network Engineer. Khi trả lời, hãy tuân theo format sau:\n\n✅ Đáp án đúng: [chỉ ghi ký tự A/B/C/D, không cần ghi lại nội dung đáp án]\n\n🧠 Phân tích yêu cầu:\n[phân tích câu hỏi và yêu cầu]\n\n🟢 Giải thích đáp án đúng:\n[giải thích chi tiết vì sao đáp án này đúng, chỉ nhắc đến ký tự đáp án]\n\n❌ Phân tích đáp án sai:\n[giải thích vì sao các đáp án khác sai, chỉ nhắc đến ký tự đáp án]\n\n✅ Kết luận:\n[tóm tắt lại đáp án đúng bằng ký tự và lý do]\n\nTrả lời ngắn gọn, dễ hiểu, bằng tiếng Việt.'; 