'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 sm:gap-4 max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <Avatar className={`h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 mt-0.5 border ${isUser ? 'border-primary/20' : 'border-muted'}`}>
          <AvatarFallback className={isUser ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Message Bubble */}
        <div className={`flex-1 overflow-hidden rounded-2xl px-4 py-3 shadow-sm ${isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-muted/50 border border-muted/50 text-foreground rounded-tl-sm'
          }`}>
          <div className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-invert dark:prose-invert' : 'dark:prose-invert'
            }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p({ children }) {
                  return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                },
                a({ node, href, children, ...props }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline font-medium"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="rounded-md overflow-hidden my-3 border bg-[#282c34]">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-[#ffffff10]">
                        <span className="text-xs text-stone-400 font-mono">{match[1]}</span>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          padding: '1rem',
                          background: 'transparent',
                          fontSize: '0.875rem',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={`${isUser ? 'bg-primary-foreground/20 text-inherit' : 'bg-muted-foreground/20 text-red-500'} px-1.5 py-0.5 rounded text-[0.9em] font-mono`} {...props}>
                      {children}
                    </code>
                  );
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className={`border-l-4 pl-4 my-2 italic ${isUser ? 'border-primary-foreground/40' : 'border-primary/40'}`}>
                      {children}
                    </blockquote>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}