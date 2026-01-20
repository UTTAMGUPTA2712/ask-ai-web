"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Send, Bot, User, Loader2, Settings,
    Menu, X, Plus, LogIn, LogOut, History, ChevronRight, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "./AuthModal";
import { cn } from "@/lib/utils";
interface Message {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
}

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    messages: Message[];
}

interface CustomUser {
    id: string;
    email?: string;
}

export default function Chat() {
    const [user, setUser] = useState<CustomUser | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        systemPrompt: "You are a helpful and concise AI assistant.",
        maxHistory: 10,
    });

    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize: Get User & Load Data
    useEffect(() => {
        let isInitialLoad = true;

        const handleInitialSession = async () => {
            // 1. Check Supabase Auth
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();

            // 2. Check Manual Session
            const manualUserRaw = localStorage.getItem("manual-session");
            const manualUser = manualUserRaw ? JSON.parse(manualUserRaw) as CustomUser : null;

            const currentUser = supabaseUser || manualUser;
            setUser(currentUser);

            if (currentUser) {
                await Promise.all([
                    loadRemoteSessions(currentUser.id),
                    loadRemotePreferences(currentUser.id)
                ]);
            }
            // Always start with a new chat on landing
            createNewChat();
            isInitialLoad = false;
        };

        handleInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (isInitialLoad) return;

            const supabaseUser = session?.user ?? null;

            // If Supabase user exists, it takes precedence
            if (supabaseUser) {
                setUser(supabaseUser);
                await Promise.all([
                    loadRemoteSessions(supabaseUser.id),
                    loadRemotePreferences(supabaseUser.id)
                ]);
                if (event === "SIGNED_IN") {
                    createNewChat();
                }
            } else {
                // If Supabase signed out, check if manual session still exists
                const manualUserRaw = localStorage.getItem("manual-session");
                if (!manualUserRaw) {
                    setSessions([]);
                    setActiveSessionId(null);
                    setUser(null);
                    createNewChat();
                }
            }
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("manual-session");
        window.location.reload();
    };

    // Persistence Logic: Remote
    const loadRemoteSessions = async (userId: string) => {
        try {
            const { data: chats, error } = await supabase
                .from("chats")
                .select("*, messages(*)")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase Error loading chats:", error);
                return;
            }

            if (chats) {
                const formatted = chats.map((c) => ({
                    ...c,
                    messages: (c.messages as Message[]).sort((a, b) =>
                        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                    )
                })) as ChatSession[];

                setSessions(formatted);
            }
        } catch (err) {
            console.error("Error loading remote sessions:", err);
        }
    };

    // Preferences Sync Logic
    const loadRemotePreferences = async (userId: string) => {
        const { data: profile } = await supabase
            .from("profiles")
            .select("system_prompt")
            .eq("id", userId)
            .single();

        if (profile?.system_prompt) {
            setPreferences(prev => ({ ...prev, systemPrompt: profile.system_prompt }));
        }
    };

    const updatePreference = async (key: string, value: string | number) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        if (user) {
            await supabase.from("profiles").update({
                system_prompt: newPrefs.systemPrompt,
                updated_at: new Date().toISOString()
            }).eq("id", user.id);
        }
    };

    // Session Management
    const createNewChat = () => {
        // If the current active session is already empty, don't create a new one
        const currentActive = sessions.find(s => s.id === activeSessionId);
        if (currentActive && currentActive.messages.length === 0) {
            return;
        }

        const newSession: ChatSession = {
            id: crypto.randomUUID(),
            title: "New Conversation",
            created_at: new Date().toISOString(),
            messages: [],
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };

    const activeSession = sessions.find(s => s.id === activeSessionId) || null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeSession?.messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !activeSessionId) return;

        const userMsg: Message = { role: "user", content: input };
        const updatedMessages = [...(activeSession?.messages || []), userMsg];

        // Update local state immediately
        const updatedSessions = sessions.map(s =>
            s.id === activeSessionId ? { ...s, messages: updatedMessages, title: s.messages.length === 0 ? input.slice(0, 30) : s.title } : s
        );
        setSessions(updatedSessions);
        setInput("");
        setIsLoading(true);

        try {
            const chatId = activeSessionId;
            if (user) {
                const { data: currentChat } = await supabase.from("chats").select("id").eq("id", chatId).single();
                if (!currentChat) {
                    await supabase.from("chats").insert({
                        id: chatId,
                        user_id: user.id,
                        title: input.slice(0, 30)
                    });
                }
                await supabase.from("messages").insert({
                    chat_id: chatId,
                    user_id: user.id,
                    role: "user",
                    content: input
                });
            }

            // 2. Call API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: preferences.systemPrompt },
                        ...updatedMessages.slice(-preferences.maxHistory),
                    ],
                }),
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

            // 3. If remote, save assistant message
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

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 300 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="relative flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
                <div className="p-4 flex flex-col h-full">
                    <button
                        onClick={createNewChat}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </button>

                    <div className="flex-1 mt-6 overflow-y-auto scrollbar-hide space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest px-2 mb-2">History</h3>
                        {sessions.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSessionId(s.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors group",
                                    activeSessionId === s.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                )}
                            >
                                <History className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate text-sm font-medium">{s.title}</span>
                                <ChevronRight className={cn("w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity", activeSessionId === s.id && "opacity-100")} />
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
                        {user ? (
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs truncate max-w-[120px] dark:text-zinc-400">{user.email}</span>
                                </div>
                                <button onClick={handleSignOut} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="w-full py-2 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In to Sync
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>
            <main className="flex-1 flex flex-col relative">

                {/* Settings Overlay */}
                <AnimatePresence>
                    {showSettings && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSettings(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            />
                            <motion.div
                                initial={{ opacity: 0, x: 300 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 300 }}
                                className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 shadow-2xl z-50 p-6 border-l border-zinc-200 dark:border-zinc-800"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h2>
                                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                                        <X className="w-5 h-5 text-zinc-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">System Prompt</label>
                                        <textarea
                                            value={preferences.systemPrompt}
                                            onChange={(e) => updatePreference("systemPrompt", e.target.value)}
                                            className="w-full h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-zinc-300"
                                            placeholder="Customize how the AI behaves..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Context Memory ({preferences.maxHistory} msgs)</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={preferences.maxHistory}
                                            onChange={(e) => updatePreference("maxHistory", parseInt(e.target.value))}
                                            className="w-full accent-indigo-600"
                                        />
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-indigo-600" />
                                            <span className="text-xs font-bold text-indigo-600 uppercase">Cloud Sync</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            {user
                                                ? "Your preferences are securely synced to your account across all devices."
                                                : "You are in Guest Mode. Sign in to save your custom prompts to the cloud."}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6 text-indigo-600" />
                            <h1 className="font-bold text-zinc-900 dark:text-zinc-50">Groq Chat</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!user && (
                            <span className="hidden sm:block text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full border border-zinc-200 dark:border-zinc-700">
                                GUEST MODE
                            </span>
                        )}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-custom">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {activeSession?.messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center pt-20 text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center"
                                >
                                    <Bot className="w-10 h-10 text-indigo-600" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">What&apos;s on your mind?</h2>
                                    <p className="text-zinc-500 max-w-sm mx-auto">Ask anything to Llama 3.3. Your thoughts are safe with our hybrid persistence.</p>
                                </div>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {activeSession?.messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex w-full gap-4",
                                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                                        m.role === "user" ? "bg-zinc-200 dark:bg-zinc-800" : "bg-indigo-600"
                                    )}>
                                        {m.role === "user" ? <User className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /> : <Bot className="w-5 h-5 text-white" />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] px-5 py-3 rounded-3xl text-sm leading-relaxed",
                                        m.role === "user"
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-none"
                                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm"
                                    )}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                </div>
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-3 rounded-3xl rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="p-6 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-zinc-50 dark:via-zinc-950 to-transparent">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSend} className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading || !activeSessionId}
                                placeholder={activeSessionId ? "Send a message..." : "Create a new chat to begin..."}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 pr-16 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-lg text-zinc-800 dark:text-zinc-100"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || !activeSessionId}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white rounded-xl transition-all shadow-md active:scale-95"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                        <p className="mt-3 text-[10px] text-center text-zinc-400 uppercase tracking-widest font-bold">
                            Groq &bull; Llama 3.3 &bull; {user ? "Cloud Synced" : "Local Storage"}
                        </p>
                    </div>
                </div>
            </main>
        </div >
    );
}
