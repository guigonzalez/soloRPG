import { create } from 'zustand';
import type { Message, SuggestedAction } from '../types/models';

interface ChatStore {
  messages: Message[];
  isAIResponding: boolean;
  streamedContent: string;
  error: string | null;
  pendingRollNotation: string | null;
  suggestedActions: SuggestedAction[];
  messagesLoaded: boolean;
  loadedMessageCount: number; // Track count when loaded
  loadGeneration: number; // Increment each time messages finish loading

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setAIResponding: (responding: boolean) => void;
  setStreamedContent: (content: string) => void;
  appendStreamedContent: (chunk: string) => void;
  setError: (error: string | null) => void;
  setPendingRoll: (notation: string | null) => void;
  setSuggestedActions: (actions: SuggestedAction[]) => void;
  setMessagesLoaded: (loaded: boolean, count: number) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isAIResponding: false,
  streamedContent: '',
  error: null,
  pendingRollNotation: null,
  suggestedActions: [],
  messagesLoaded: false,
  loadedMessageCount: 0,
  loadGeneration: 0,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  setAIResponding: (responding) => set({ isAIResponding: responding }),

  setStreamedContent: (content) => set({ streamedContent: content }),

  appendStreamedContent: (chunk) => set((state) => ({
    streamedContent: state.streamedContent + chunk,
  })),

  setError: (error) => set({ error }),

  setPendingRoll: (notation) => set({ pendingRollNotation: notation }),

  setSuggestedActions: (actions) => set({ suggestedActions: actions }),

  setMessagesLoaded: (loaded, count) => set((state) => ({
    messagesLoaded: loaded,
    loadedMessageCount: count,
    loadGeneration: state.loadGeneration + 1 // Increment generation counter
  })),

  clearMessages: () => set({ messages: [], streamedContent: '', error: null, suggestedActions: [], messagesLoaded: false, loadedMessageCount: 0 }),
}));
