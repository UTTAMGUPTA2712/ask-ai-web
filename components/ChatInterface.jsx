'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Menu } from 'lucide-react';
import { useAppStore } from '@/lib/context/StoreContext';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { ChatMessage } from './ChatMessage';
import { toast } from 'sonner';

export function ChatInterface({ chatId = null, initialMessages = [], initialChat = null, loading = false, onMenuClick }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [chat, setChat] = useState(initialChat);
  const scrollRef = useRef(null);
  const { selectedGPT, user, setChatCache, addMessageToCache, updateLastMessageInCache, setChats } = useAppStore();

  // Update messages when initialMessages changes (for route changes)
  useEffect(() => {
    setMessages(initialMessages);
    setChat(initialChat);
  }, [chatId, initialMessages, initialChat]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    // Add user message to local state
    setMessages(prev => [...prev, userMessage]);

    // Update cache if we're in an existing chat
    if (chatId) {
      addMessageToCache(chatId, userMessage);
    }

    setInput('');
    setIsStreaming(true);

    // Add empty assistant message
    const emptyAssistantMsg = {
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, emptyAssistantMsg]);

    if (chatId) {
      addMessageToCache(chatId, emptyAssistantMsg);
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          chatId: chatId,
          customGPTId: selectedGPT?.id,
          messages: messages, // Send previous messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Update the last message with the complete response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = data.message;
        return newMessages;
      });

      // Update cache
      if (chatId) {
        updateLastMessageInCache(chatId, data.message.content);
      }

      // If this was a new chat, redirect to the chat URL
      if (data.chatId && !chatId) {
        // Cache the new chat data
        const newMessages = [...messages, userMessage, data.message];
        setChatCache(data.chatId, {
          chat: { id: data.chatId, title: data.title },
          messages: newMessages,
        });

        // Update chats list in sidebar immediately
        setChats(prev => [{
          id: data.chatId,
          title: data.title,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }, ...prev]);

        // Navigate to the new chat
        router.push(`/chat/${data.chatId}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI');
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden flex items-center gap-3 p-3 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">
          {chat?.title || 'Ask AI'}
        </h1>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" viewportRef={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading chat...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-4 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold">Ask AI</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {selectedGPT
                  ? `Chatting with ${selectedGPT.name}`
                  : 'Start a conversation with AI'}
              </p>
              {selectedGPT && selectedGPT.description && (
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {selectedGPT.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-3 sm:p-4 bg-background">
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Type your message..." : "Sign in to start chatting..."}
            disabled={!user || isStreaming}
            className="min-h-[60px] max-h-[200px] resize-none text-sm sm:text-base"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || !user}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
