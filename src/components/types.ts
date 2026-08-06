export type MessageRole = 'user' | 'assistant';

export interface QuestionTemplate {
    question: string;
    answer: string;
    answer_type: string;
    images: string[];
}

export interface StreamChunk {
    text: string;
    delay: number;
}

export interface ChatMessage {
    id: string;
    question: string;
    answer: string;
    answer_type: string;
    images: string[];
    timestamp: number;
    role?: MessageRole; // optional for compat
}

export interface BubbleProps {
    role: MessageRole;
    content: string;
    images?: string[];
    timestamp?: number;
    isStreaming?: boolean;
    avatarLabel?: string;
}

export interface ResponseProps {
    answer: string;
    images?: string[];
    answer_type?: string;
    isStreaming?: boolean;
    messageId?: string;
}
