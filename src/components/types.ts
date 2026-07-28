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
}