'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/context/StoreContext';
import { ChatInterface } from '@/components/ChatInterface';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { toast } from 'sonner';

export default function ChatPage({ params }) {
    const [loading, setLoading] = useState(true);
    const { getChatCache, setChatCache, setSidebarOpen, isAuthInitialized } = useAppStore();
    const chatId = params?.chatId;

    // Get cached data
    const cachedData = getChatCache(chatId);
    const [chat, setChat] = useState(cachedData?.chat || null);
    const [messages, setMessages] = useState(cachedData?.messages || []);

    useEffect(() => {
        if (!isAuthInitialized) return;

        // Load chat data - check cache first
        if (chatId) {
            const cached = getChatCache(chatId);

            if (cached) {
                // Use cached data
                setChat(cached.chat);
                setMessages(cached.messages);
                setLoading(false);
            } else {
                // Fetch from API
                loadChatData();
            }
        }
    }, [chatId, isAuthInitialized]);

    const loadChatData = async () => {
        if (!chatId) return;

        try {
            setLoading(true);
            const headers = await getAuthHeaders();

            // Load chat and messages in parallel
            const [chatRes, messagesRes] = await Promise.all([
                fetch(`/api/chats/${chatId}`, { headers }),
                fetch(`/api/chats/${chatId}/messages`, { headers })
            ]);

            if (chatRes.ok && messagesRes.ok) {
                const chatData = await chatRes.json();
                const messagesData = await messagesRes.json();

                const chat = chatData.chat;
                const messages = messagesData.messages || [];

                // Update local state
                setChat(chat);
                setMessages(messages);

                // Cache the data
                setChatCache(chatId, { chat, messages });
            } else {
                console.error('Failed to load chat');
                toast.error('Failed to load chat. Please try again.');
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
            toast.error(`Error loading chat: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!chatId) {
        return <div>Loading...</div>;
    }

    return (
        <ChatInterface
            chatId={chatId}
            initialMessages={messages}
            initialChat={chat}
            loading={loading}
            onMenuClick={() => setSidebarOpen(true)}
        />
    );
}
