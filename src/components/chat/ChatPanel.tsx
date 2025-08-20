'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../../styles/chat.css';
import { useAI } from '../../ai/useAI';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { QuickSuggestions } from './QuickSuggestions';
import { TypingIndicator } from './TypingIndicator';

interface ChatPanelProps { 
  open: boolean; 
  onClose: () => void; 
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ open, onClose }) => {
  const { messages, status, send } = useAI();
  const [input, setInput] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { 
      if (e.key === 'Escape' && open) onClose(); 
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return; 
    send(input.trim()); 
    setInput('');
  }, [input, send]);

  return (
    <aside 
      className={`chat-panel ${open ? 'open' : ''}`} 
      aria-label="AI Chat Assistant" 
      aria-hidden={!open} 
      ref={ref}
    >
      <div className="chat-panel__header">
        <h2 className="chat-panel__title">Assistant</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close Chat">✖</button>
      </div>
      <div className="chat-panel__body">
        {messages.length === 0 && status === 'idle' ? (
          <div className="chat-empty">
            <p className="chat-empty__headline">How can I help you today?</p>
            <QuickSuggestions onSelect={setInput} />
          </div>
        ) : (
          <MessageList messages={messages} status={status} />
        )}
        {status === 'streaming' && <TypingIndicator />}
      </div>
      <Composer 
        value={input} 
        onChange={setInput} 
        onSubmit={handleSend} 
        disabled={status === 'thinking' || status === 'streaming'} 
      />
    </aside>
  );
};