'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageSquare, LogOut, User, Sparkles, X, Library, ChevronDown, Sun } from 'lucide-react';
import { useAppStore } from '@/lib/context/StoreContext';
import { supabase } from '@/lib/supabase/client';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { toast } from 'sonner';
import { CustomGPTModal } from './CustomGPTModal';
import { CustomGPTGallery } from './CustomGPTGallery';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Sidebar({ onNewChat, onAuthClick, isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    chats,
    setUser,
    customGPTs,
    starredGPTs,
    selectedGPT,
    setSelectedGPT,
    setStarredGPTs,
    chatsLoaded,
    customGPTsLoaded,
    starredGPTsLoaded,
    clearCache,
    setChats,
    setCustomGPTs
  } = useAppStore();
  const { toggleTheme } = useTheme();
  const [showGPTModal, setShowGPTModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    // Load data only if user is logged in and data hasn't been loaded yet
    if (user) {
      if (!chatsLoaded) {
        loadChats();
      }
      if (!customGPTsLoaded) {
        loadCustomGPTs();
      }
      if (!starredGPTsLoaded) {
        loadStarredGPTs();
      }
    }
  }, [user, chatsLoaded, customGPTsLoaded, starredGPTsLoaded]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById('mobile-sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const loadChats = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/chats', { headers });
      const data = await response.json();
      // Directly call setChats from context
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast.error('Failed to load chats');
    }
  };

  const loadCustomGPTs = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/custom-gpts', { headers });
      const data = await response.json();
      // Directly call setCustomGPTs from context
      setCustomGPTs(data.customGPTs || []);
    } catch (error) {
      console.error('Failed to load custom GPTs:', error);
    }
  };

  const loadStarredGPTs = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/custom-gpts/starred', { headers });
      const data = await response.json();
      setStarredGPTs(data.customGPTs || []); // This comes from useAppStore destructuring
    } catch (error) {
      console.error('Failed to load starred GPTs:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // useStore.setState({ chats: [], customGPTs: [] }) - Context doesn't have setState
      // Instead call individual setters if needed, or clearCache handles flags
      // But clearing state manually:
      // In Context, we rely on clearCache
      // useStore.getState().clearCache(); 
      // Context exposes clearCache directly
      clearCache(); // Assuming this is destructured from useAppStore

      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleChatSelect = (chat) => {
    // Navigate to chat page
    router.push(`/chat/${chat.id}`);

    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleGPTSelect = (gpt) => {
    // Set the selected GPT
    setSelectedGPT(gpt);

    // Navigate to root to start new chat with this GPT
    router.push('/');

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "flex h-full flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out z-50",
          // Mobile: overlay drawer
          "fixed inset-y-0 left-0 w-[280px] lg:relative lg:w-64",
          // Transform based on open state
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with close button for mobile */}
        <div className="flex items-center justify-between p-4 lg:block lg:p-4">
          <h2 className="text-lg font-semibold lg:hidden">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-4 pb-2 space-y-2">
          <Button onClick={onNewChat} className="w-full h-11" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          <Button
            onClick={() => setShowGallery(true)}
            variant="outline"
            className="w-full h-11"
            size="sm"
          >
            <Library className="mr-2 h-4 w-4" />
            Custom GPTs
          </Button>
        </div>

        <Separator />

        {user && (customGPTs.length > 0 || starredGPTs.length > 0) && (
          <>
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Custom GPTs</h3>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  <Button
                    variant={!selectedGPT ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-10"
                    size="sm"
                    onClick={() => handleGPTSelect(null)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Default
                  </Button>
                  {/* User's own GPTs */}
                  {customGPTs.map((gpt) => (
                    <Button
                      key={gpt.id}
                      variant={selectedGPT?.id === gpt.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-10"
                      size="sm"
                      onClick={() => handleGPTSelect(gpt)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {gpt.name}
                    </Button>
                  ))}
                  {/* Starred GPTs (excluding ones user already owns) */}
                  {starredGPTs
                    .filter(starred => !customGPTs.find(own => own.id === starred.id))
                    .map((gpt) => (
                      <Button
                        key={gpt.id}
                        variant={selectedGPT?.id === gpt.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm h-10"
                        size="sm"
                        onClick={() => handleGPTSelect(gpt)}
                        title={`By ${gpt.creator_name}`}
                      >
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                        {gpt.name}
                      </Button>
                    ))}
                </div>
              </ScrollArea>
            </div>
            <Separator />
          </>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Recent Chats</h3>
          </div>
          <ScrollArea className="h-full px-3">
            <div className="space-y-1 pb-4">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant={pathname === `/chat/${chat.id}` ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm truncate h-10"
                  size="sm"
                  onClick={() => handleChatSelect(chat)}
                >
                  <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{chat.title || 'New Chat'}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="p-4 space-y-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm w-full hover:bg-accent rounded-md p-2 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="truncate font-medium text-sm">{user.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); toggleTheme(); }} className="cursor-pointer">
                  <Sun className="mr-2 h-4 w-4" />
                  Toggle Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Guest Mode</span>
                <ThemeToggle />
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full h-10"
                onClick={onAuthClick}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </div>
          )}
        </div>

        <CustomGPTModal
          open={showGPTModal}
          onOpenChange={setShowGPTModal}
          onCreated={loadCustomGPTs}
        />

        <CustomGPTGallery
          open={showGallery}
          onOpenChange={setShowGallery}
          onCreateNew={() => {
            setShowGallery(false);
            setShowGPTModal(true);
          }}
        />
      </div>
    </>
  );
}
