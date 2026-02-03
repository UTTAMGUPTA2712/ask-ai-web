'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [customGPTs, setCustomGPTs] = useState([]);
    const [publicGPTs, setPublicGPTs] = useState([]);
    const [starredGPTs, setStarredGPTs] = useState([]);
    const [selectedGPT, setSelectedGPT] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Flags to prevent redundant loading
    const [chatsLoaded, setChatsLoaded] = useState(false);
    const [customGPTsLoaded, setCustomGPTsLoaded] = useState(false);
    const [starredGPTsLoaded, setStarredGPTsLoaded] = useState(false);

    // Chat cache: { [chatId]: { chat, messages, loadedAt } }
    const [chatCache, setCache] = useState({});

    // Setters with load flags
    const handleSetChats = (newChats) => {
        setChats(newChats);
        setChatsLoaded(true);
    };

    const handleSetCustomGPTs = (newGPTs) => {
        setCustomGPTs(newGPTs);
        setCustomGPTsLoaded(true);
    };

    const handleSetStarredGPTs = (newStarred) => {
        setStarredGPTs(newStarred);
        setStarredGPTsLoaded(true);
    };

    const setChatCache = (chatId, data) => {
        setCache(prev => ({
            ...prev,
            [chatId]: {
                ...data,
                loadedAt: Date.now(),
            },
        }));
    };

    const getChatCache = (chatId) => {
        const cache = chatCache[chatId];
        if (!cache) return null;

        // Cache valid for 5 minutes
        const CACHE_DURATION = 5 * 60 * 1000;
        const isExpired = Date.now() - cache.loadedAt > CACHE_DURATION;

        return isExpired ? null : cache;
    };

    const addMessageToCache = (chatId, message) => {
        const cached = chatCache[chatId];
        if (!cached) return;

        setCache(prev => ({
            ...prev,
            [chatId]: {
                ...cached,
                messages: [...cached.messages, message],
            },
        }));
    };

    const updateLastMessageInCache = (chatId, content) => {
        const cached = chatCache[chatId];
        if (!cached || !cached.messages.length) return;

        const messages = [...cached.messages];
        messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content,
        };

        setCache(prev => ({
            ...prev,
            [chatId]: {
                ...cached,
                messages,
            },
        }));
    };

    const clearCache = () => {
        setCache({});
        setChatsLoaded(false);
        setCustomGPTsLoaded(false);
        setStarredGPTsLoaded(false);
    };

    const value = {
        user,
        chats,
        customGPTs,
        publicGPTs,
        starredGPTs,
        selectedGPT,
        isLoading,
        chatsLoaded,
        customGPTsLoaded,
        starredGPTsLoaded,
        chatCache,

        setUser,
        setChats: handleSetChats,
        setCustomGPTs: handleSetCustomGPTs,
        setPublicGPTs,
        setStarredGPTs: handleSetStarredGPTs,
        setSelectedGPT,
        setIsLoading,

        setChatCache,
        getChatCache,
        addMessageToCache,
        updateLastMessageInCache,
        clearCache,
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};

export const useAppStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useAppStore must be used within a StoreProvider');
    }
    return context;
};
