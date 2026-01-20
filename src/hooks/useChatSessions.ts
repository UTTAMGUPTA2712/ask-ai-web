import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CustomUser, ChatSession, Message, CustomGpt, ChatPreferences } from "@/types/chat";

interface UseChatSessionsProps {
    user: CustomUser | null;
    customGpts: CustomGpt[];
    preferences: ChatPreferences;
}

export function useChatSessions({ user, customGpts, preferences }: UseChatSessionsProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const loadRemoteSessions = async (userId: string) => {
        try {
            const { data: chats, error } = await supabase
                .from("chats")
                .select("*, messages(*)")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (chats) {
                const formatted = chats.map((c) => ({
                    ...c,
                    messages: (c.messages as any[]).sort((a, b) =>
                        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                    ) as Message[]
                })) as ChatSession[];
                setSessions(formatted);
            }
        } catch (err) {
            console.error("Error loading remote sessions:", err);
        }
    };

    useEffect(() => {
        if (user) {
            loadRemoteSessions(user.id);
        } else {
            // clear sessions if logged out and existing sessions are user-bound (simplified for now)
            // In guest mode, we might want to keep local sessions or handle differently, but per original logic:
            const manualUserRaw = localStorage.getItem("manual-session");
            if (!manualUserRaw && !user) {
                setSessions([]);
                setActiveSessionId(null);
            }
        }
    }, [user]);

    const createNewChat = (gptId: string | null = null) => {
        const currentActive = sessions.find(s => s.id === activeSessionId);

        // If the current active session is already empty, just update its GPT association
        if (currentActive && currentActive.messages.length === 0) {
            if (currentActive.gpt_id !== gptId) {
                setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, gpt_id: gptId } : s));
            }
            return;
        }

        const newSession: ChatSession = {
            id: crypto.randomUUID(),
            title: "New Conversation",
            created_at: new Date().toISOString(),
            messages: [],
            gpt_id: gptId
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };

    // Ensure there is always one chat if sessions are empty
    useEffect(() => {
        if (sessions.length === 0 && !isLoading) {
            createNewChat();
        }
    }, [sessions.length]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const activeSession = sessions.find(s => s.id === activeSessionId) || null;

    useEffect(() => {
        scrollToBottom();
    }, [activeSession?.messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading || !activeSessionId) return;

        const userMsg: Message = { role: "user", content: input };
        const updatedMessages = [...(activeSession?.messages || []), userMsg];

        setSessions(prev =>
            prev.map(s =>
                s.id === activeSessionId ? { ...s, messages: updatedMessages, title: s.messages.length === 0 ? input.slice(0, 30) : s.title } : s
            )
        );
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            const chatId = activeSessionId;
            // 1. Save User Message (if user exists)
            if (user) {
                // Check if chat exists, if not create it
                const { data: currentChat } = await supabase.from("chats").select("id").eq("id", chatId).single();
                if (!currentChat) {
                    await supabase.from("chats").insert({
                        id: chatId,
                        user_id: user.id,
                        title: currentInput.slice(0, 30),
                        gpt_id: activeSession?.gpt_id
                    });
                }
                await supabase.from("messages").insert({
                    chat_id: chatId,
                    user_id: user.id,
                    role: "user",
                    content: currentInput
                });
            }

            // 2. Prepare System Prompt
            let systemPrompt = preferences.systemPrompt;
            if (activeSession?.gpt_id) {
                const gpt = customGpts.find(g => g.id === activeSession.gpt_id);
                if (gpt) systemPrompt = gpt.instructions;
            }

            // 3. Prepare Messages for API (SANITIZATION FIX)
            const historyToInclude = updatedMessages.slice(-preferences.maxHistory);
            const apiMessages = [
                { role: "system", content: systemPrompt },
                ...historyToInclude.map(m => ({ role: m.role, content: m.content })) // STRICTLY SANITIZED
            ];

            // 4. Call API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages }),
            });

            if (!response.body) return;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                assistantContent += decoder.decode(value);

                setSessions(prev => prev.map(s =>
                    s.id === activeSessionId
                        ? { ...s, messages: [...updatedMessages, { role: "assistant", content: assistantContent }] }
                        : s
                ));
            }

            // 5. Save Assistant Message (if user exists)
            if (user) {
                await supabase.from("messages").insert({
                    chat_id: chatId,
                    user_id: user.id,
                    role: "assistant",
                    content: assistantContent
                });
            }

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sessions,
        activeSessionId,
        setActiveSessionId,
        input,
        setInput,
        isLoading,
        createNewChat,
        messagesEndRef,
        handleSend,
        activeSession,
        setSessions // exposed for deletion if needed or manual updates
    };
}
