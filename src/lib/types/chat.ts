export interface LinkItem {
  label: string;
  url: string;
  type?: 'external' | 'internal' | 'email' | 'tel';
  description?: string;
}

export interface MediaItem {
  src: string
  alt: string
  caption?: string
  sourceLabel?: string
  sourceUrl?: string
  width?: number
  height?: number
}

export type MessageRole = 'user' | 'assistant';

export interface QuestionTemplate {
  question: string;
  answer: string;
  answer_type: string;
  images: MediaItem[];
  links?: LinkItem[];
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
  images: MediaItem[];
  links?: LinkItem[];
  timestamp: number;
  role?: MessageRole;
}

export interface BubbleProps {
  role: MessageRole;
  content: string;
  images?: MediaItem[];
  timestamp?: number;
  isStreaming?: boolean;
  avatarLabel?: string;
}

export interface ResponseProps {
  answer: string;
  images?: MediaItem[];
  links?: LinkItem[];
  answer_type?: string;
  isStreaming?: boolean;
  messageId?: string;
}
