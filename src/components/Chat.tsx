"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Menu, Settings, Bot } from "lucide-react";
import { useChatAuth } from "@/hooks/useChatAuth";
import { useCustomGpts } from "@/hooks/useCustomGpts";
import { useChatPreferences } from "@/hooks/useChatPreferences";
import { useChatSessions } from "@/hooks/useChatSessions";
import { Sidebar } from "@/components/chat/Sidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { GptModal, SettingsModal } from "@/components/chat/Modals";

// We keep AuthModal where it was or move it if we want strict separation, 
// for now deriving it from the original location to avoid breaking its internal deps if any.
// Assuming AuthModal is a standalone component, we can leave it.
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });

export default function Chat() {
    const { user, handleSignOut, supabase } = useChatAuth();
    const { customGpts, isGptModalOpen, setIsGptModalOpen, editingGpt, setEditingGpt, isGptSaving, saveGpt, deleteGpt, loadCustomGpts } = useCustomGpts(user);
    const { preferences, updatePreference } = useChatPreferences(user);

    // Pass dependencies to session hook
    const {
        sessions,
        activeSessionId,
        setActiveSessionId,
        input,
        setInput,
        isLoading,
        createNewChat,
        handleSend,
        activeSession
    } = useChatSessions({ user, customGpts, preferences });

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    // Derived state
    const activeGpt = activeSession?.gpt_id ? customGpts.find(g => g.id === activeSession.gpt_id) : undefined;

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-black overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            <GptModal
                isOpen={isGptModalOpen}
                onClose={() => { setIsGptModalOpen(false); setEditingGpt(null); }}
                activeGpt={editingGpt}
                user={user}
                isSaving={isGptSaving}
                onSave={saveGpt}
                onLoginRequest={() => setIsAuthModalOpen(true)}
            />

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                preferences={preferences}
                onUpdatePreference={updatePreference}
                user={user}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                user={user}
                sessions={sessions}
                activeSessionId={activeSessionId}
                customGpts={customGpts}
                activeGptId={activeSession?.gpt_id}
                onNewChat={createNewChat}
                onSelectSession={setActiveSessionId}
                onOpenGptModal={(gpt) => { setEditingGpt(gpt || null); setIsGptModalOpen(true); }}
                onDeleteGpt={deleteGpt}
                onSignIn={() => setIsAuthModalOpen(true)}
                onSignOut={handleSignOut}
            />

            <main className="flex-1 flex flex-col relative bg-white dark:bg-zinc-950/50">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Dynamic Header Title based on Context */}
                            {activeGpt ? (
                                <>
                                    <span className="text-zinc-300">/</span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeGpt.name}</span>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-indigo-600" />
                                    <span className="font-bold text-zinc-900 dark:text-white">Ask AI</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!user && (
                            <span className="hidden sm:block text-[10px] px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-full border border-zinc-200 dark:border-zinc-800 font-bold tracking-wide">
                                GUEST MODE
                            </span>
                        )}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <MessageList
                    session={activeSession}
                    isLoading={isLoading}
                    customGpt={activeGpt}
                />

                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSubmit={handleSend}
                    isLoading={isLoading}
                    isDisabled={!activeSessionId || isLoading}
                />
            </main>
        </div>
    );
}
