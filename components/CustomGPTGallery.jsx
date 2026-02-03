'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Plus, Search, User, Star } from 'lucide-react';
import { useAppStore } from '@/lib/context/StoreContext';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CustomGPTGallery({ open, onOpenChange, onCreateNew }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const { user, publicGPTs, setPublicGPTs, starredGPTs, setStarredGPTs, setSelectedGPT } = useAppStore();

    // Context doesn't offer a toggleStarGPT helper that handles state directly like zustand might have in a single call
    // We will implement optimistic update locally or use the context setters.
    // Looking at StoreContext, it doesn't seem to export toggleStarGPT.
    // We'll need to implement the logic here using setPublicGPTs/setStarredGPTs.

    useEffect(() => {
        if (open) {
            loadPublicGPTs();
            if (user) {
                loadStarredGPTs();
            }
        }
    }, [open, user]);

    const loadPublicGPTs = async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders();
            const response = await fetch('/api/custom-gpts/public', { headers });
            const data = await response.json();
            setPublicGPTs(data.customGPTs || []);
        } catch (error) {
            console.error('Failed to load public GPTs:', error);
            toast.error('Failed to load custom GPTs');
        } finally {
            setLoading(false);
        }
    };

    const loadStarredGPTs = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/custom-gpts/starred', { headers });
            const data = await response.json();
            setStarredGPTs(data.customGPTs || []);
        } catch (error) {
            console.error('Failed to load starred GPTs:', error);
        }
    };

    const handleToggleStar = async (gpt, e) => {
        e.stopPropagation();

        if (!user) {
            toast.error('Please sign in to star GPTs');
            return;
        }

        const isStarred = gpt.is_starred;

        // Optimistic update
        // Update publicGPTs
        setPublicGPTs(publicGPTs.map(g =>
            g.id === gpt.id ? { ...g, is_starred: !isStarred } : g
        ));

        // Update starredGPTs
        if (!isStarred) {
            setStarredGPTs([...starredGPTs, { ...gpt, is_starred: true }]);
        } else {
            setStarredGPTs(starredGPTs.filter(g => g.id !== gpt.id));
        }

        try {
            const headers = await getAuthHeaders();
            const url = `/api/custom-gpts/${gpt.id}/star`;
            const response = await fetch(url, {
                method: isStarred ? 'DELETE' : 'POST',
                headers,
            });

            if (!response.ok) throw new Error('Failed to update star');

            toast.success(isStarred ? 'Removed from starred' : 'Added to starred');

            // Reload starred GPTs
            if (user) {
                loadStarredGPTs();
            }
        } catch (error) {
            // Revert optimistic update on error
            setPublicGPTs(publicGPTs.map(g =>
                g.id === gpt.id ? { ...g, is_starred: isStarred } : g
            ));

            // Revert starredGPTs
            if (!isStarred) {
                setStarredGPTs(starredGPTs.filter(g => g.id !== gpt.id));
            } else {
                // Trying to add it back might be tricky if we don't have the full object, 
                // but gpt variable holds it.
                setStarredGPTs([...starredGPTs, gpt]);
            }
            toast.error('Failed to update star');
            console.error('Star toggle error:', error);
        }
    };

    const handleUseGPT = (gpt) => {
        setSelectedGPT(gpt);
        toast.success(`Now using ${gpt.name}`);
        onOpenChange(false);
    };

    const displayGPTs = activeTab === 'starred' ? starredGPTs : publicGPTs;

    const filteredGPTs = displayGPTs.filter(gpt =>
        gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gpt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gpt.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">Custom GPTs</DialogTitle>
                    <DialogDescription className="text-sm">
                        Browse and use custom AI personalities created by the community
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">All GPTs</TabsTrigger>
                        <TabsTrigger value="starred">
                            Starred {starredGPTs.length > 0 && `(${starredGPTs.length})`}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="flex-1 overflow-hidden flex flex-col mt-4">
                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            {/* Header Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search GPTs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-11"
                                    />
                                </div>
                                <Button onClick={onCreateNew} className="h-11 whitespace-nowrap">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New GPT
                                </Button>
                            </div>

                            {/* GPT Grid */}
                            <ScrollArea className="flex-1">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center space-y-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                            <p className="text-sm text-muted-foreground">Loading GPTs...</p>
                                        </div>
                                    </div>
                                ) : filteredGPTs.length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center space-y-3 max-w-md">
                                            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                                            <h3 className="text-lg font-semibold">
                                                {searchQuery ? 'No GPTs found' : activeTab === 'starred' ? 'No starred GPTs yet' : 'No public GPTs yet'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {searchQuery
                                                    ? 'Try a different search term'
                                                    : activeTab === 'starred'
                                                        ? 'Star your favorite GPTs to see them here'
                                                        : 'Be the first to create a public custom GPT!'}
                                            </p>
                                            {!searchQuery && activeTab !== 'starred' && (
                                                <Button onClick={onCreateNew} variant="outline" className="mt-4">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Your First GPT
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                        {filteredGPTs.map((gpt) => (
                                            <div
                                                key={gpt.id}
                                                className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors bg-card relative"
                                            >
                                                {/* Star Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-8 w-8"
                                                    onClick={(e) => handleToggleStar(gpt, e)}
                                                >
                                                    <Star
                                                        className={cn(
                                                            "h-4 w-4 transition-colors",
                                                            gpt.is_starred
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-muted-foreground hover:text-yellow-400"
                                                        )}
                                                    />
                                                </Button>

                                                <div className="space-y-2 pr-8">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-semibold text-base line-clamp-1">{gpt.name}</h3>
                                                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                                    </div>
                                                    {gpt.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {gpt.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span className="truncate">{gpt.creator_name}</span>
                                                </div>

                                                <Button
                                                    onClick={() => handleUseGPT(gpt)}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full h-9"
                                                >
                                                    Use This GPT
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
