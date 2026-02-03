import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  chats: [],
  currentChat: null,
  messages: [],
  customGPTs: [],
  selectedGPT: null,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setMessages: (messages) => set({ messages }),
  setCustomGPTs: (customGPTs) => set({ customGPTs }),
  setSelectedGPT: (gpt) => set({ selectedGPT: gpt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  updateLastMessage: (content) => set((state) => {
    const newMessages = [...state.messages];
    if (newMessages.length > 0) {
      newMessages[newMessages.length - 1].content = content;
    }
    return { messages: newMessages };
  }),
  
  clearMessages: () => set({ messages: [] }),
}));
