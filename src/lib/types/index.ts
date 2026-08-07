export * from './chat';
export * from './sidebar';

declare global {
  interface Window {
    chatHistoryApi?: {
      load: () => void;
      get: () => import('./chat').ChatMessage[];
      set: (newHistory: import('./chat').ChatMessage[]) => void;
      add: (msg: import('./chat').ChatMessage) => void;
      clear: () => void;
      showTyping: (show: boolean) => void;
      scrollToBottom: (smooth?: boolean) => void;
    };
    addLibraryMedia?: (item: Partial<import('./sidebar').LibraryItem>) => void;
    toggleSidebar?: () => void;
    __CHAT_STORE__?: any;
  }
}
