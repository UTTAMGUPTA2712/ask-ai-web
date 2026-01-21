import { Plus, History, ChevronRight, LogIn, LogOut, Settings, Trash2, Sparkles, Star, Search, LayoutGrid, X } from "lucide-react";
import Image from "next/image";
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
    onToggleStarGpt: (id: string, isStarred: boolean) => void;
    onOpenMarketplace: () => void;
    onSignIn: () => void;
    onSignOut: () => void;
    onClose?: () => void;
}

const groupSessions = (sessions: ChatSession[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    return {
        today: sessions.filter(s => new Date(s.created_at) >= today),
        yesterday: sessions.filter(s => new Date(s.created_at) >= yesterday && new Date(s.created_at) < today),
        previous: sessions.filter(s => new Date(s.created_at) >= last7Days && new Date(s.created_at) < yesterday),
        older: sessions.filter(s => new Date(s.created_at) < last7Days)
    };
};

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
    onToggleStarGpt,
    onOpenMarketplace,
    onSignIn,
    onSignOut,
    onClose
}) => {
    const grouped = groupSessions(sessions);
    const starredGpts = customGpts.filter(gpt => user?.starred_gpt_ids?.includes(gpt.id));
    const otherGpts = customGpts.filter(gpt => !user?.starred_gpt_ids?.includes(gpt.id) && gpt.user_id === user?.id);
    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
            className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] absolute md:relative z-40"
        >
            <div className="flex flex-col h-full p-4 w-[320px]"> {/* Fixed width inner container for content stability */}

                {/* Mobile Header */}
                <div className="flex md:hidden items-center justify-between mb-4 px-1">
                    <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* New Chat Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNewChat()}
                    className="w-full py-3.5 px-4 bg-[#127387] hover:bg-[#0f6271] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#127387]/20 transition-all mb-8"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Chat</span>
                </motion.button>

                <div className="flex-1 overflow-y-auto space-y-8 pr-2">

                    {/* My Custom GPTs */}
                    <div>
                        <h3 className="text-[10px] font-black text-zinc-500 dark:text-zinc-300 uppercase tracking-widest px-2 mb-3">My Personalities</h3>
                        <motion.button
                            whileHover={{ x: 4 }}
                            onClick={onOpenMarketplace}
                            className="w-full text-left p-2.5 rounded-lg flex items-center gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-brand-primary dark:text-brand-primary transition-all group mb-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <Search className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">Discover GPTs</span>
                        </motion.button>

                        {starredGpts.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2 mb-3 flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-current" />
                                    Starred
                                </h3>
                                <div className="space-y-1">
                                    {starredGpts.map(gpt => (
                                        <GptItem key={gpt.id} gpt={gpt} activeGptId={activeGptId} onNewChat={onNewChat} onOpenGptModal={onOpenGptModal} onDeleteGpt={onDeleteGpt} onToggleStar={() => onToggleStarGpt(gpt.id, true)} isStarred={true} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {user && (
                            <>
                                <h3 className="text-[10px] font-black text-zinc-500 dark:text-zinc-300 uppercase tracking-widest px-2 mb-3">My GPTs</h3>
                                <motion.button
                                    whileHover={{ x: 4 }}
                                    onClick={() => onOpenGptModal()}
                                    className="w-full text-left p-2.5 rounded-lg flex items-center gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-brand-primary dark:text-brand-primary transition-all group mb-2"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold">Create Persona</span>
                                </motion.button>

                                <div className="space-y-1">
                                    {otherGpts.map(gpt => (
                                        <GptItem key={gpt.id} gpt={gpt} activeGptId={activeGptId} onNewChat={onNewChat} onOpenGptModal={onOpenGptModal} onDeleteGpt={onDeleteGpt} onToggleStar={() => onToggleStarGpt(gpt.id, false)} isStarred={false} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Chat History Grouped */}
                    <div>
                        <HistoryGroup title="Today" sessions={grouped.today} activeSessionId={activeSessionId} onSelectSession={onSelectSession} />
                        <HistoryGroup title="Yesterday" sessions={grouped.yesterday} activeSessionId={activeSessionId} onSelectSession={onSelectSession} />
                        <HistoryGroup title="Previous 7 Days" sessions={grouped.previous} activeSessionId={activeSessionId} onSelectSession={onSelectSession} />
                        <HistoryGroup title="Older" sessions={grouped.older} activeSessionId={activeSessionId} onSelectSession={onSelectSession} />
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="pt-4 mt-auto border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {user ? (
                        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-xs font-bold text-white shadow-md">
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

const GptItem = ({ gpt, activeGptId, onNewChat, onOpenGptModal, onDeleteGpt, onToggleStar, isStarred }: any) => (
    <div className="group relative">
        <button
            onClick={() => onNewChat(gpt.id)}
            className={cn(
                "w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all",
                activeGptId === gpt.id
                    ? "bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary dark:text-brand-secondary ring-1 ring-brand-primary/20"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
            )}
        >
            <div className="w-8 h-8 rounded-lg bg-[#127387]/10 flex items-center justify-center flex-shrink-0 p-1.5">
                <Image src="/favicon-32x32.png" alt="GPT" width={20} height={20} className="object-contain" />
            </div>
            <span className="truncate text-sm font-medium">{gpt.name}</span>
            {gpt.is_public && <span className="ml-auto text-[8px] font-bold text-brand-primary border border-brand-primary/30 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Public</span>}
        </button>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all bg-white dark:bg-zinc-900 shadow-md rounded-xl p-1 border border-zinc-100 dark:border-zinc-800 z-10">
            <button
                onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
                className={cn("p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all", isStarred ? "text-amber-500" : "text-zinc-400")}
                title={isStarred ? "Unstar" : "Star"}
            >
                <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onOpenGptModal(gpt); }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all text-zinc-500"
                title="Edit GPT"
            >
                <Settings className="w-4 h-4" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteGpt(gpt.id); }}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-all"
                title="Delete GPT"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const HistoryGroup = ({ title, sessions, activeSessionId, onSelectSession }: any) => {
    if (sessions.length === 0) return null;
    return (
        <div className="mb-6">
            <h3 className="text-[10px] font-black text-zinc-500 dark:text-zinc-300 uppercase tracking-widest px-2 mb-3">{title}</h3>
            <div className="space-y-1">
                {sessions.map((s: any) => (
                    <button
                        key={s.id}
                        onClick={() => onSelectSession(s.id)}
                        className={cn(
                            "w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all group",
                            activeSessionId === s.id
                                ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-semibold"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-600 dark:text-zinc-300"
                        )}
                    >
                        <History className={cn("w-4 h-4 flex-shrink-0", activeSessionId === s.id ? "text-brand-primary dark:text-brand-secondary" : "text-zinc-400")} />
                        <span className="truncate text-sm">{s.title}</span>
                        <ChevronRight className={cn("w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all text-zinc-400", activeSessionId === s.id && "opacity-100")} />
                    </button>
                ))}
            </div>
        </div>
    );
};
