'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useStore } from '@/lib/store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { AuthModal } from '@/components/AuthModal';
import { Toaster } from 'sonner';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';

export default function ChatPage({ params }) {
    const router = useRouter();
    const [showAuth, setShowAuth] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { setUser, getChatCache, setChatCache } = useStore();
    const chatId = params?.chatId;

    // Get cached data
    const cachedData = getChatCache(chatId);
    const [chat, setChat] = useState(cachedData?.chat || null);
    const [messages, setMessages] = useState(cachedData?.messages || []);

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                handleGoogleUserCreation(session.user);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);

                if (event === 'SIGNED_IN' && session.user.app_metadata.provider === 'google') {
                    await handleGoogleUserCreation(session.user);
                }
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
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
    }, [chatId]);

    const handleGoogleUserCreation = async (user) => {
        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!existingUser) {
                const session = await supabase.auth.getSession();
                const token = session.data.session?.access_token;

                if (token) {
                    await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata.full_name || user.email.split('@')[0],
                            password: 'Password123',
                        }),
                    });
                }
            }
        } catch (error) {
            console.error('Error creating Google user:', error);
        }
    };

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
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        router.push('/');
        setSidebarOpen(false);
    };

    if (!chatId) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                onNewChat={handleNewChat}
                onAuthClick={() => setShowAuth(true)}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="flex-1 overflow-hidden">
                <ChatInterface
                    chatId={chatId}
                    initialMessages={messages}
                    initialChat={chat}
                    loading={loading}
                    onMenuClick={() => setSidebarOpen(true)}
                />
            </main>
            <AuthModal open={showAuth} onOpenChange={setShowAuth} />
            <Toaster position="top-center" />
        </div>
    );
}
