"use client";

import React, { useState } from "react";
import { Search, Star, MessageSquare, X, LayoutGrid } from "lucide-react";
import { CustomGpt, CustomUser } from "@/types/chat";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MarketplaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    publicGpts: CustomGpt[];
    user: CustomUser | null;
    onToggleStar: (gptId: string, currentState: boolean) => void;
    onSelectGpt: (gptId: string) => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
    isOpen,
    onClose,
    publicGpts,
    user,
    onToggleStar,
    onSelectGpt
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredGpts = publicGpts.filter(gpt =>
        gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gpt.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <LayoutGrid className="w-6 h-6 text-brand-primary" />
                                    GPT Marketplace
                                </h2>
                                <p className="text-sm text-zinc-500 mt-1">Discover specialized AI personas created by the community.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Marketplace Grid */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredGpts.map(gpt => (
                                <motion.div
                                    key={gpt.id}
                                    whileHover={{ y: -4 }}
                                    className="group relative bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-lg hover:border-brand-primary/30 transition-all cursor-pointer"
                                    onClick={() => { onSelectGpt(gpt.id); onClose(); }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center p-2.5">
                                            <Image
                                                src="/favicon-32x32.png"
                                                alt={gpt.name}
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                            />
                                        </div>
                                        {user && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleStar(gpt.id, user.starred_gpt_ids?.includes(gpt.id) ?? false); }}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    user.starred_gpt_ids?.includes(gpt.id) ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
                                                )}
                                            >
                                                <Star className={cn("w-4 h-4", user.starred_gpt_ids?.includes(gpt.id) && "fill-current")} />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">{gpt.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 h-8">{gpt.description}</p>

                                    <button
                                        className="w-full mt-4 py-2.5 px-4 bg-[#127387] hover:bg-[#0f6271] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Chat Now
                                    </button>
                                </motion.div>
                            ))}
                            {filteredGpts.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-zinc-400 text-sm">No personalities found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
