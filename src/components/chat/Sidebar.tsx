import React from "react";
import { Plus, History, ChevronRight, LogIn, LogOut, Settings, Trash2, Bot, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatSession, CustomGpt, CustomUser } from "@/types/chat";

interface SidebarProps {
    isOpen: boolean;
    user: CustomUser | null;
    sessions: ChatSession[];
    activeSessionId: string | null;
    customGpts: CustomGpt[];
    activeGptId?: string | null;
    onNewChat: (gptId?: string) => void;
    onSelectSession: (id: string) => void;
    onOpenGptModal: (gpt?: CustomGpt) => void;
    onDeleteGpt: (id: string) => void;
    onSignIn: () => void;
    onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    user,
    sessions,
    activeSessionId,
    customGpts,
    activeGptId,
    onNewChat,
    onSelectSession,
    onOpenGptModal,
    onDeleteGpt,
    onSignIn,
    onSignOut
}) => {
    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
            className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative z-30"
        >
            <div className="flex flex-col h-full p-4 w-[320px]"> {/* Fixed width inner container for content stability */}

                {/* New Chat Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNewChat()}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all mb-8"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Chat</span>
                </motion.button>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 space-y-8 pr-2">

                    {/* My Custom GPTs */}
                    <div>
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-3">My Personalities</h3>
                        <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => onOpenGptModal()}
                            className="w-full text-left p-2.5 rounded-lg flex items-center gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-indigo-600 dark:text-indigo-400 transition-all group mb-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">Create Persona</span>
                        </motion.button>

                        <div className="space-y-1">
                            {customGpts.filter(g => g.user_id === user?.id).map(gpt => (
                                <div key={gpt.id} className="group relative">
                                    <button
                                        onClick={() => onNewChat(gpt.id)}
                                        className={cn(
                                            "w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all",
                                            activeGptId === gpt.id
                                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20"
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="truncate text-sm font-medium">{gpt.name}</span>
                                        {gpt.is_public && <span className="ml-auto text-[8px] font-bold text-indigo-500 border border-indigo-500/30 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Public</span>}
                                    </button>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-0.5 border border-zinc-100 dark:border-zinc-800">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onOpenGptModal(gpt); }}
                                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-all text-zinc-500"
                                            title="Edit GPT"
                                        >
                                            <Settings className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteGpt(gpt.id); }}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-md transition-all"
                                            title="Delete GPT"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community GPTs */}
                    {customGpts.filter(g => g.is_public && g.user_id !== user?.id).length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-3">Community</h3>
                            <div className="space-y-1">
                                {customGpts.filter(g => g.is_public && g.user_id !== user?.id).map(gpt => (
                                    <button
                                        key={gpt.id}
                                        onClick={() => onNewChat(gpt.id)}
                                        className={cn(
                                            "w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all",
                                            activeGptId === gpt.id
                                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20"
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <span className="truncate text-sm font-medium">{gpt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat History */}
                    <div>
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-3">History</h3>
                        <div className="space-y-1">
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => onSelectSession(s.id)}
                                    className={cn(
                                        "w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all group",
                                        activeSessionId === s.id
                                            ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium"
                                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-500 dark:text-zinc-400"
                                    )}
                                >
                                    <History className={cn("w-4 h-4 flex-shrink-0", activeSessionId === s.id ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} />
                                    <span className="truncate text-sm">{s.title}</span>
                                    <ChevronRight className={cn("w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all text-zinc-400", activeSessionId === s.id && "opacity-100")} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="pt-4 mt-auto border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {user ? (
                        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate max-w-[120px]">My Account</span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px] opacity-70 group-hover:opacity-100 transition-opacity">{user.email}</span>
                                </div>
                            </div>
                            <button onClick={onSignOut} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-all" title="Sign Out">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onSignIn}
                            className="w-full py-3 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-300"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In to Sync
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};
