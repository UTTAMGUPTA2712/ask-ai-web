import { create } from 'zustand';

export const useStore = create((set, get) => ({
  user: null,
  chats: [],
  customGPTs: [],
  publicGPTs: [],
  starredGPTs: [],
  selectedGPT: null,
  isLoading: false,

  // Chat cache: { [chatId]: { chat, messages, loadedAt } }
  chatCache: {},

  // Flags to prevent redundant loading
  chatsLoaded: false,
  customGPTsLoaded: false,
  starredGPTsLoaded: false,

  setUser: (user) => set({ user }),
  setChats: (chats) => set({ chats, chatsLoaded: true }),
  setCustomGPTs: (customGPTs) => set({ customGPTs, customGPTsLoaded: true }),
  setPublicGPTs: (publicGPTs) => set({ publicGPTs }),
  setStarredGPTs: (starredGPTs) => set({ starredGPTs, starredGPTsLoaded: true }),
  setSelectedGPT: (gpt) => set({ selectedGPT: gpt }),
  setIsLoading: (isLoading) => set({ isLoading }),

  toggleStarGPT: (gptId) => set((state) => {
    const isStarred = state.publicGPTs.find(g => g.id === gptId)?.is_starred;
    return {
      publicGPTs: state.publicGPTs.map(g =>
        g.id === gptId ? { ...g, is_starred: !isStarred } : g
      ),
    };
  }),

  // Cache chat data
  setChatCache: (chatId, data) => set((state) => ({
    chatCache: {
      ...state.chatCache,
      [chatId]: {
        ...data,
        loadedAt: Date.now(),
      },
    },
  })),

  // Get cached chat data
  getChatCache: (chatId) => {
    const cache = get().chatCache[chatId];
    if (!cache) return null;

    // Cache valid for 5 minutes
    const CACHE_DURATION = 5 * 60 * 1000;
    const isExpired = Date.now() - cache.loadedAt > CACHE_DURATION;

    return isExpired ? null : cache;
  },

  // Add message to cached chat
  addMessageToCache: (chatId, message) => set((state) => {
    const cached = state.chatCache[chatId];
    if (!cached) return state;

    return {
      chatCache: {
        ...state.chatCache,
        [chatId]: {
          ...cached,
          messages: [...cached.messages, message],
        },
      },
    };
  }),

  // Update last message in cached chat
  updateLastMessageInCache: (chatId, content) => set((state) => {
    const cached = state.chatCache[chatId];
    if (!cached || !cached.messages.length) return state;

    const messages = [...cached.messages];
    messages[messages.length - 1] = {
      ...messages[messages.length - 1],
      content,
    };

    return {
      chatCache: {
        ...state.chatCache,
        [chatId]: {
          ...cached,
          messages,
        },
      },
    };
  }),

  // Clear cache (on logout)
  clearCache: () => set({
    chatCache: {},
    chatsLoaded: false,
    customGPTsLoaded: false,
    starredGPTsLoaded: false,
  }),
}));
