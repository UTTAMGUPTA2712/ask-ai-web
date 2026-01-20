import React from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    isDisabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSubmit, isLoading, isDisabled }) => {
    return (
        <div className="p-6 pb-8 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent z-20">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={onSubmit} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity blur-xl" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isDisabled}
                        placeholder={isDisabled ? "Create a new chat to begin..." : "Send a message..."}
                        className={cn(
                            "w-full bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 pr-16 outline-none focus:ring-0 transition-all shadow-xl dark:shadow-zinc-900/50 text-zinc-800 dark:text-zinc-100 relative z-10 placeholder:text-zinc-400",
                            "group-focus-within:border-indigo-500/50 dark:group-focus-within:border-indigo-500/50"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isDisabled || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white rounded-xl transition-all shadow-lg active:scale-95 z-20 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
                <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] text-center text-zinc-400 uppercase tracking-widest font-bold">
                        Llama 3.3 Enhanced
                    </p>
                </div>
            </div>
        </div>
    );
};
