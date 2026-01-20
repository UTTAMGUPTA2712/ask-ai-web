"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Trash2, Settings, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Preferences {
    systemPrompt: string;
    maxHistory: number;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<Preferences>({
        systemPrompt: "You are a helpful and concise AI assistant.",
        maxHistory: 10,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load preferences from local storage
    useEffect(() => {
        const saved = localStorage.getItem("chat-preferences");
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse preferences", e);
            }
        }

        const savedMessages = localStorage.getItem("chat-history");
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    // Save preferences to local storage
    useEffect(() => {
        localStorage.setItem("chat-preferences", JSON.stringify(preferences));
    }, [preferences]);

    // Save history to local storage
    useEffect(() => {
        localStorage.setItem("chat-history", JSON.stringify(messages));
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: preferences.systemPrompt },
                        ...newMessages.slice(-preferences.maxHistory),
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            // Add placeholder assistant message
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: "assistant", content: assistantContent },
                ]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please check your API key and try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem("chat-history");
    };

    return (
        <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                            Groq Assistant
                            <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">Llama 3.3-70b</span>
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Powered by Groq LPUs</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearChat}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-red-500"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-indigo-500"
                        title="Settings"
                    >
                        <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-300`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {showSettings && (
                    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Chat Preferences
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">System Prompt</label>
                                <textarea
                                    value={preferences.systemPrompt}
                                    onChange={(e) => setPreferences({ ...preferences, systemPrompt: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Context Window (Messages)</label>
                                <input
                                    type="number"
                                    value={preferences.maxHistory}
                                    onChange={(e) => setPreferences({ ...preferences, maxHistory: parseInt(e.target.value) })}
                                    className="w-24 px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {messages.length === 0 && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500 pt-12">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                            <Bot className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold dark:text-zinc-100">How can I help you today?</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                Ask me anything! I&apos;m powered by Llama 3.3 70B and running at lightspeed on Groq.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in ${m.role === 'user' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'} fade-in duration-300`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-indigo-600"}`}>
                                {m.role === "user" ? <User className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-none"
                                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                            <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder="Type your message..."
                        className="w-full px-5 py-4 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all pr-12 text-zinc-800 dark:text-zinc-200 shadow-inner group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-800 text-white rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
                <p className="text-[10px] text-center mt-3 text-zinc-400 uppercase tracking-widest font-medium">
                    Llama 3.3 70B • Real-time Streaming • Local History
                </p>
            </div>
        </div>
    );
}
