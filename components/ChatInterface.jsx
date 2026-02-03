'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { ChatMessage } from './ChatMessage';
import { toast } from 'sonner';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);
  const { messages, addMessage, updateLastMessage, currentChat, setCurrentChat, selectedGPT, user } = useStore();

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

    // Add user message
    addMessage(userMessage);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant message
    addMessage({
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    });

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          chatId: currentChat?.id,
          customGPTId: selectedGPT?.id,
          messages: messages.slice(0, -1), // Send previous messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Update the last message with the complete response
      updateLastMessage(data.message);
      
      // Update current chat if new
      if (data.chatId && !currentChat) {
        setCurrentChat({ id: data.chatId, title: data.title });
        
        // Reload chats list
        const chatsHeaders = await getAuthHeaders();
        const chatsResponse = await fetch('/api/chats', { headers: chatsHeaders });
        const chatsData = await chatsResponse.json();
        useStore.setState({ chats: chatsData.chats || [] });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI');
      // Remove the empty assistant message on error
      useStore.setState((state) => ({
        messages: state.messages.slice(0, -1),
      }));
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
      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-8">
              <h1 className="text-4xl font-bold">AI Chat</h1>
              <p className="text-muted-foreground">
                {selectedGPT 
                  ? `Chat with ${selectedGPT.name}` 
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
          <div>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-2 p-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isStreaming}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-[60px] w-[60px]"
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
