'use client';
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../../packages/ai-core/src/types';
import '../../styles/chat.css';
import { MessageBubble } from './MessageBubble';

interface MessageListProps { 
  messages: ChatMessage[]; 
  status: string; 
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages.length]);
  
  return (
    <div className="message-list" role="log" aria-live="polite">
      {messages.map(m => <MessageBubble key={m.id} message={m} />)}
      <div ref={bottomRef} />
    </div>
  );
};