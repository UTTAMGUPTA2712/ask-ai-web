'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageSquare, LogOut, User, Settings, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { supabase } from '@/lib/supabase/client';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { toast } from 'sonner';
import { CustomGPTModal } from './CustomGPTModal';

export function Sidebar({ onNewChat, onAuthClick }) {
  const { user, chats, currentChat, setCurrentChat, setUser, customGPTs, selectedGPT, setSelectedGPT } = useStore();
  const [showGPTModal, setShowGPTModal] = useState(false);

  useEffect(() => {
    // Load chats
    if (user) {
      loadChats();
      loadCustomGPTs();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/chats', { headers });
      const data = await response.json();
      useStore.setState({ chats: data.chats || [] });
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadCustomGPTs = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/custom-gpts', { headers });
      const data = await response.json();
      useStore.setState({ customGPTs: data.customGPTs || [] });
    } catch (error) {
      console.error('Failed to load custom GPTs:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      useStore.setState({ chats: [], customGPTs: [], currentChat: null, messages: [] });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      <div className="p-4 space-y-2">
        <Button onClick={onNewChat} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        
        {user && (
          <Button 
            onClick={() => setShowGPTModal(true)} 
            variant="outline" 
            className="w-full" 
            size="sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            New Custom GPT
          </Button>
        )}
      </div>

      <Separator />

      {user && customGPTs.length > 0 && (
        <>
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Custom GPTs</h3>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                <Button
                  variant={!selectedGPT ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  size="sm"
                  onClick={() => setSelectedGPT(null)}
                >
                  <MessageSquare className="mr-2 h-3 w-3" />
                  Default
                </Button>
                {customGPTs.map((gpt) => (
                  <Button
                    key={gpt.id}
                    variant={selectedGPT?.id === gpt.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    size="sm"
                    onClick={() => setSelectedGPT(gpt)}
                  >
                    <Sparkles className="mr-2 h-3 w-3" />
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
                variant={currentChat?.id === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm truncate"
                size="sm"
                onClick={async () => {
                  setCurrentChat(chat);
                  // Load messages for this chat
                  const headers = await getAuthHeaders();
                  fetch(`/api/chats/${chat.id}/messages`, { headers })
                    .then(res => res.json())
                    .then(data => useStore.setState({ messages: data.messages || [] }));
                }}
              >
                <MessageSquare className="mr-2 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{chat.title || 'New Chat'}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />
      
      <div className="p-4">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            onClick={onAuthClick}
          >
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>

      <CustomGPTModal 
        open={showGPTModal} 
        onOpenChange={setShowGPTModal}
        onCreated={loadCustomGPTs}
      />
    </div>
  );
}
