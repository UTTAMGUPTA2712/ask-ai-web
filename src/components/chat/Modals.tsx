import React from "react";
import { X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomGpt, CustomUser, ChatPreferences } from "@/types/chat";

// --- GptModal ---

interface GptModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeGpt: CustomGpt | null;
    user: CustomUser | null;
    isSaving: boolean;
    onSave: (formData: FormData) => Promise<void>;
    onLoginRequest: () => void;
}

export const GptModal: React.FC<GptModalProps> = ({ isOpen, onClose, activeGpt, user, isSaving, onSave, onLoginRequest }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        {activeGpt ? "Edit Persona" : "New Persona"}
                                    </h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Design a custom AI personality.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            {(!user) && (
                                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex gap-3 text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <div className="text-xs font-medium leading-relaxed">
                                        Cloud sync is required to save custom personas. <button onClick={onLoginRequest} className="underline font-bold hover:text-amber-800">Sign in now</button>.
                                    </div>
                                </div>
                            )}

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!user) {
                                    onLoginRequest();
                                    return;
                                }
                                await onSave(new FormData(e.currentTarget));
                            }} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Name</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={activeGpt?.name}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand-primary transition-all dark:text-zinc-100 font-medium"
                                        placeholder="e.g., Coding Mentor"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Description</label>
                                    <input
                                        name="description"
                                        defaultValue={activeGpt?.description}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand-primary transition-all dark:text-zinc-100"
                                        placeholder="What does this persona do?"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">User Greeting (Optional)</label>
                                    <input
                                        name="user_instruction"
                                        defaultValue={activeGpt?.user_instruction}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand-primary transition-all dark:text-zinc-100"
                                        placeholder="e.g., Hello! How can I help you today?"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Instructions</label>
                                    <textarea
                                        name="instructions"
                                        required
                                        defaultValue={activeGpt?.instructions}
                                        className="w-full h-64 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand-primary transition-all resize-none dark:text-zinc-100 font-mono text-sm leading-relaxed"
                                        placeholder="You are an expert React developer..."
                                    />
                                </div>
                                <div className="flex items-center gap-3 py-2 px-1">
                                    <input
                                        type="checkbox"
                                        name="is_public"
                                        id="is_public"
                                        defaultChecked={activeGpt?.is_public}
                                        className="w-5 h-5 accent-brand-primary rounded-lg cursor-pointer"
                                    />
                                    <label htmlFor="is_public" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                                        Make Public <span className="text-[10px] font-normal text-zinc-400 block tracking-normal uppercase">Share with the community</span>
                                    </label>
                                </div>
                                <button
                                    disabled={isSaving}
                                    className="w-full py-4 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (activeGpt ? "Save Changes" : "Create Persona")}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- SettingsModal ---

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    preferences: ChatPreferences;
    onUpdatePreference: (key: keyof ChatPreferences, value: string | number) => void;
    user: CustomUser | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, preferences, onUpdatePreference, user }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className="fixed right-0 top-0 h-full w-[360px] bg-white dark:bg-zinc-950 shadow-2xl z-50 p-6 border-l border-zinc-200 dark:border-zinc-800 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h2>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Base System Prompt</label>
                                <textarea
                                    value={preferences.systemPrompt}
                                    onChange={(e) => onUpdatePreference("systemPrompt", e.target.value)}
                                    className="w-full h-40 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-mono leading-relaxed resize-none outline-none focus:ring-2 focus:ring-brand-primary transition-all dark:text-zinc-300"
                                    placeholder="Customize how the AI behaves..."
                                />
                                <p className="text-[10px] text-zinc-400">Overrides the default behavior when no specific persona is selected.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Context Memory</label>
                                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">{preferences.maxHistory} msgs</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={preferences.maxHistory}
                                    onChange={(e) => onUpdatePreference("maxHistory", parseInt(e.target.value))}
                                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 dark:from-brand-primary/10 dark:to-brand-secondary/10 p-5 rounded-2xl border border-brand-primary/10 dark:border-brand-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-brand-primary" />
                                    <span className="text-xs font-bold text-brand-primary dark:text-brand-secondary uppercase">Cloud Sync Status</span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {user
                                        ? "Active. Your preferences and personas are synced across devices."
                                        : "Inactive. Sign in to save your configuration permanently."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
