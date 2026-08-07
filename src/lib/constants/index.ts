export * from './storage-keys';
export const DEFAULT_CHAT_STATUS = 'idle' as const;
export const CHAT_TYPING_DELAY_MIN = 400;
export const CHAT_TYPING_DELAY_MAX = 2000;
export const CHAT_STREAM_CHUNK_SIZE = 4;
export const CHAT_STREAM_INTERVAL_MS = 18;
export const FALLBACK_ANSWER =
  "I'm sorry, I don't have an answer for that yet. Try asking about me, my experience, or projects!";
