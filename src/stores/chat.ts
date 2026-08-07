/**
 * GPT-like Chat Store — nanostores (v1.4.2) — Astro-only SPA
 * Project: personal-web-portofolio
 *
 * Design:
 * - Single source: $messages (alias $chatMessages for legacy)
 * - Derived: $hasChats, $messageCount, $isEmpty, $lastMessage, $isStreaming, $messagesWithImages
 * - Atoms: isTyping, pendingQuestion, selectedTemplate, currentInput, streamingContent, error, chatStatus, pendingMessageId, suggestions
 * - Map: uiState
 * - Actions: plain functions (nanostores v1 doesn't export action)
 * - Matching: fuzzy score exact > includes > jaccard
 * - Persistence: auto localStorage + optional enablePersistence()
 */

import { atom, computed, map } from 'nanostores';
import type { ChatMessage, QuestionTemplate } from '../lib/types/chat';

// Re-export for consumers that import types from store
export type { ChatMessage, QuestionTemplate };

// Extended types
export type ChatStatus = 'idle' | 'typing' | 'streaming' | 'error';

export interface UIState {
  isWrapped: boolean;
  inputFocused: boolean;
  showDisclaimer: boolean;
  isComposing: boolean;
  showSuggestions: boolean;
}

export interface SendMessageOptions {
  typingDelay?: number;
  simulateStreaming?: boolean;
  streamingChunkSize?: number;
  streamingIntervalMs?: number;
  fallbackAnswer?: string;
}

export interface MatchResult {
  template: QuestionTemplate;
  score: number;
}

const STORAGE_KEY = 'fadlan-chat-history';
const LEGACY_KEYS = ['fadlan-temp', 'chat:messages'];

// -------------------- helpers pure --------------------
function genId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[?!.]+$/g, '');
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function calculateMatchScore(input: string, templateQuestion: string): number {
  const nInput = normalize(input);
  const nTemplate = normalize(templateQuestion);
  if (!nInput || !nTemplate) return 0;
  if (nInput === nTemplate) return 1;
  if (nInput.includes(nTemplate) || nTemplate.includes(nInput)) {
    const minLen = Math.min(nInput.length, nTemplate.length);
    const maxLen = Math.max(nInput.length, nTemplate.length);
    return 0.8 + 0.19 * (minLen / maxLen);
  }
  const setInput = new Set(tokenize(nInput));
  const setTpl = new Set(tokenize(nTemplate));
  if (setInput.size === 0 || setTpl.size === 0) return 0;
  let inter = 0;
  setInput.forEach((t) => {
    if (setTpl.has(t)) inter++;
  });
  const union = setInput.size + setTpl.size - inter;
  const jaccard = union === 0 ? 0 : inter / union;
  return jaccard >= 0.5 ? 0.5 + jaccard * 0.3 : jaccard * 0.6;
}

export function findBestMatch(
  input: string,
  templates: QuestionTemplate[],
  threshold = 0.3
): MatchResult | null {
  if (!input.trim() || !templates.length) return null;
  let best: MatchResult | null = null;
  for (const tmpl of templates) {
    const score = calculateMatchScore(input, tmpl.question);
    if (!best || score > best.score) best = { template: tmpl, score };
  }
  return best && best.score >= threshold ? best : null;
}

function loadFromStorage(key = STORAGE_KEY): ChatMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(msgs: readonly ChatMessage[] | ChatMessage[], key = STORAGE_KEY): void {
  if (!isBrowser()) return;
  try {
    if (msgs.length) localStorage.setItem(key, JSON.stringify(msgs));
    else localStorage.removeItem(key);
  } catch {}
}

// -------------------- atoms --------------------
export const $messages = atom<ChatMessage[]>([]);
// legacy alias kept because sibling agent and old ChatHistory code may import $chatMessages
export const $chatMessages = $messages;

export const $isTyping = atom<boolean>(false);
export const $pendingQuestion = atom<string | null>(null);
export const $selectedTemplate = atom<QuestionTemplate | null>(null);
export const $selectedQuestion = $selectedTemplate; // alias for sibling compat

export const $currentInput = atom<string>('');
export const $streamingContent = atom<string>('');
export const $error = atom<string | null>(null);
export const $chatStatus = atom<ChatStatus>('idle');
export const $pendingMessageId = atom<string | null>(null);
export const $suggestions = atom<string[]>([]);

export const $uiState = map<UIState>({
  isWrapped: false,
  inputFocused: false,
  showDisclaimer: false,
  isComposing: false,
  showSuggestions: true,
});

// -------------------- computed (readonly safe) --------------------
export const $hasChats = computed($messages, (msgs) => {
  return (msgs as readonly ChatMessage[]).length > 0;
});

export const $messageCount = computed($messages, (msgs) => {
  return (msgs as readonly ChatMessage[]).length;
});

export const $isEmpty = computed($hasChats, (has) => !has);

export const $lastMessage = computed($messages, (msgs) => {
  const arr = msgs as readonly ChatMessage[];
  return arr.length ? arr[arr.length - 1] : null;
});

export const $isStreaming = computed([$isTyping, $streamingContent], (typing, streaming) => {
  return (typing as boolean) && (streaming as string).length > 0;
});

export const $showDisclaimer = computed($hasChats, (has) => !!has);

export const $messagesWithImages = computed($messages, (msgs) => {
  return (msgs as readonly ChatMessage[]).filter((m) => m.images && m.images.length > 0);
});

// -------------------- persistence auto --------------------
if (isBrowser()) {
  const saved = loadFromStorage();
  if (saved.length > 0) {
    $messages.set(saved);
    $uiState.setKey('showDisclaimer', true);
  }
  $messages.listen((msgs) => {
    saveToStorage(msgs as ChatMessage[]);
  });
}

// -------------------- actions plain functions --------------------
export function setTyping(value: boolean): void {
  $isTyping.set(value);
  $chatStatus.set(value ? 'typing' : 'idle');
  if (!value) {
    $streamingContent.set('');
    $pendingMessageId.set(null);
  }
}

export function setInput(value: string): void {
  $currentInput.set(value);
}

export function setError(value: string | null): void {
  $error.set(value);
  if (value) $chatStatus.set('error');
  else if ($chatStatus.get() === 'error') $chatStatus.set('idle');
}

export function setPendingQuestion(value: string | null): void {
  $pendingQuestion.set(value);
}

export function setSelectedTemplate(tmpl: QuestionTemplate | null): void {
  $selectedTemplate.set(tmpl);
}

export function setSelectedQuestion(tmpl: QuestionTemplate | null): void {
  setSelectedTemplate(tmpl);
}

export function setUIState(patch: Partial<UIState>): void {
  $uiState.set({ ...$uiState.get(), ...patch });
}

export function setSuggestions(list: string[]): void {
  $suggestions.set(list);
}

export function addMessage(msg: ChatMessage): void {
  const curr = $messages.get() as ChatMessage[];
  $messages.set([...curr, msg]);
}

export function updateMessage(id: string, patch: Partial<ChatMessage>): void {
  const curr = $messages.get() as ChatMessage[];
  $messages.set(curr.map((m) => (m.id === id ? { ...m, ...patch } : m)));
}

export function removeMessage(id: string): void {
  const curr = $messages.get() as ChatMessage[];
  $messages.set(curr.filter((m) => m.id !== id));
}

export function clearHistory(): void {
  $messages.set([]);
  $isTyping.set(false);
  $pendingQuestion.set(null);
  $selectedTemplate.set(null);
  $streamingContent.set('');
  $pendingMessageId.set(null);
  $error.set(null);
  $chatStatus.set('idle');
  $uiState.setKey('showDisclaimer', false);
  if (isBrowser()) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      for (const k of LEGACY_KEYS) localStorage.removeItem(k);
    } catch {}
  }
}

export const clearChat = clearHistory;

export function setHasChats(value: boolean): void {
  if (!value) clearHistory();
}

export function refreshSuggestions(templates: QuestionTemplate[], max = 4): void {
  const askedArr = ($messages.get() as ChatMessage[]).map((m) => normalize(m.question));
  const asked = new Set(askedArr);
  const candidates = templates.map((t) => t.question).filter((q) => !asked.has(normalize(q)));
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  $suggestions.set(shuffled.slice(0, max));
}

export function buildChatMessage(
  question: string,
  answer: string,
  answer_type: string = 'text',
  images: string[] = []
): ChatMessage {
  return {
    id: genId(),
    question: question.trim(),
    answer: answer.trim(),
    answer_type,
    images,
    timestamp: Date.now(),
  };
}

function computeTypingDelay(answer: string, baseMs = 400): number {
  const len = answer.length;
  return Math.min(Math.max(baseMs, len * 12), 2000);
}

async function streamIntoMessage(
  messageId: string,
  fullAnswer: string,
  opts: { chunkSize: number; intervalMs: number }
): Promise<void> {
  $chatStatus.set('streaming');
  $pendingMessageId.set(messageId);
  for (let i = 0; i < fullAnswer.length; i += opts.chunkSize) {
    const streamed = fullAnswer.slice(0, i + opts.chunkSize);
    $streamingContent.set(streamed);
    updateMessage(messageId, { answer: streamed });
    await new Promise((r) => setTimeout(r, opts.intervalMs));
    const stillExists =
      ($messages.get() as ChatMessage[]).findIndex((m) => m.id === messageId) !== -1;
    if (!stillExists) break;
  }
  $streamingContent.set('');
  $pendingMessageId.set(null);
}

export async function sendMessage(
  rawQuestion: string,
  templates: QuestionTemplate[],
  options: SendMessageOptions = {}
): Promise<ChatMessage | null> {
  const question = rawQuestion.trim();
  if (!question) return null;

  const {
    typingDelay,
    simulateStreaming = false,
    streamingChunkSize = 4,
    streamingIntervalMs = 18,
    fallbackAnswer = "I'm sorry, I don't have an answer for that yet. Try asking about me, my experience, or projects!",
  } = options;

  if ($isTyping.get()) return null;

  try {
    $error.set(null);
    $pendingQuestion.set(question);
    $isTyping.set(true);
    $chatStatus.set('typing');
    $uiState.setKey('showDisclaimer', true);

    const match = findBestMatch(question, templates);
    const tmpl = match?.template ?? null;
    $selectedTemplate.set(tmpl);

    const answer = tmpl?.answer ?? fallbackAnswer;
    const answer_type = tmpl?.answer_type ?? 'text';
    const images = tmpl?.images ?? [];

    const message = buildChatMessage(question, simulateStreaming ? '' : answer, answer_type, images);
    const delay = typingDelay ?? computeTypingDelay(answer);

    if (simulateStreaming) {
      addMessage(message);
      await new Promise((r) => setTimeout(r, Math.min(delay, 600)));
      await streamIntoMessage(message.id, answer, {
        chunkSize: streamingChunkSize,
        intervalMs: streamingIntervalMs,
      });
      updateMessage(message.id, { answer });
    } else {
      await new Promise((r) => setTimeout(r, delay));
      addMessage(message);
    }

    refreshSuggestions(templates);
    $currentInput.set('');
    $pendingQuestion.set(null);
    $isTyping.set(false);
    $chatStatus.set('idle');

    const final = $messages.get() as ChatMessage[];
    return final.find((m) => m.id === message.id) ?? message;
  } catch (e: any) {
    const msg = e?.message ?? 'Failed to send message';
    $error.set(msg);
    $chatStatus.set('error');
    $isTyping.set(false);
    $pendingQuestion.set(null);
    $streamingContent.set('');
    $pendingMessageId.set(null);
    return null;
  }
}

export function enablePersistence(key = STORAGE_KEY): () => void {
  if (!isBrowser()) return () => {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length) {
        $messages.set(parsed);
        $uiState.setKey('showDisclaimer', true);
      }
    }
  } catch {}
  const unsub = $messages.subscribe((msgs) => {
    saveToStorage(msgs as ChatMessage[], key);
  });
  return unsub;
}


if (typeof window !== 'undefined') {
  (window as any).__CHAT_STORE__ = {
    $messages,
    $chatMessages,
    $hasChats,
    $isTyping,
    $pendingQuestion,
    $selectedTemplate,
    $selectedQuestion,
    $suggestions,
    $uiState,
    $messageCount,
    $lastMessage,
    $isStreaming,
    sendMessage,
    clearHistory,
    clearChat,
    addMessage,
    updateMessage,
    removeMessage,
    refreshSuggestions,
    findBestMatch,
    calculateMatchScore,
    enablePersistence,
  };
}
