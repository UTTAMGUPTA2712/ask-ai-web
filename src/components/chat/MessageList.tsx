import React, { useEffect, useRef } from "react";
import { CustomGpt, ChatSession } from "@/types/chat";
import Image from "next/image";
import { User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageListProps {
    session: ChatSession | null;
    isLoading: boolean;
    customGpt?: CustomGpt;
}

export const MessageList: React.FC<MessageListProps> = ({ session, isLoading, customGpt }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session?.messages, isLoading]);

    if (!session) return null;

    if (session.messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center pt-20 text-center space-y-8 px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, padding: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-100 to-white dark:from-zinc-800 dark:to-zinc-700 rounded-[2rem] flex items-center justify-center shadow-xl relative z-10 border border-white/50 dark:border-white/10 p-4">
                        {customGpt ? (
                            <SparklesIcon className="w-12 h-12 text-indigo-500" />
                        ) : (
                            <Image
                                src="/favicon-512x512.png"
                                alt="Ask AI Logo"
                                width={64}
                                height={64}
                                className="object-contain"
                            />
                        )}
                    </div>
                </motion.div>
                <div className="space-y-3 z-10">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
                        {customGpt ? `Hello, I'm ${customGpt.name}` : "How can I help you?"}
                    </h2>
                    <p className="text-zinc-500 max-w-md mx-auto text-lg font-medium leading-relaxed">
                        {customGpt
                            ? customGpt.description || "I'm ready to assist you with your tasks."
                            : "Ask anything. I'm capable of writing code, solving problems, and creative writing."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-custom">
            <div className="max-w-3xl mx-auto space-y-6">
                <AnimatePresence initial={false}>
                    {session.messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex w-full gap-4 group",
                                m.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                m.role === "user"
                                    ? "bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800"
                                    : "bg-gradient-to-br from-indigo-600 to-violet-600"
                            )}>
                                {m.role === "user" ? (
                                    <User className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                                ) : (
                                    <div className="relative w-6 h-6 flex items-center justify-center">
                                        <Image
                                            src="/favicon-32x32.png"
                                            alt="AI"
                                            width={24}
                                            height={24}
                                            className="object-contain brightness-0 invert"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={cn(
                                "max-w-[85%] px-6 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                                m.role === "user"
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-sm"
                                    : "bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 rounded-tl-sm backdrop-blur-sm"
                            )}>
                                <div className="prose dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 dark:prose-pre:bg-black/50 prose-pre:border prose-pre:border-zinc-800 dark:prose-pre:border-zinc-800/50 prose-pre:rounded-xl max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return match ? (
                                                    <div className="relative group/code my-4 rounded-xl overflow-hidden">
                                                        <div className="absolute top-0 left-0 right-0 px-4 py-1.5 bg-zinc-800/50 backdrop-blur border-b border-white/5 flex items-center justify-between">
                                                            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">{match[1]}</span>
                                                        </div>
                                                        <pre className="!bg-zinc-900 !m-0 !p-4 !pt-10 scrollbar-thin scrollbar-thumb-zinc-700">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg shadow-indigo-500/20">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>
        </div>
    );
};

// Helper for the empty state icon
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
