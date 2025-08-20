import React, { useState } from 'react';
import { useAI } from '../ai/useAI';
import { Button } from './ui/ButtonNew';

export const ChatExample: React.FC = () => {
  const { messages, status, send } = useAI();
  const [input, setInput] = useState('');
  
  return (
    <div style={{ border: '1px solid #e4e7ec', borderRadius: 8, padding: 16, maxWidth: 600 }}>
      <div style={{ minHeight: 160, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map(m => (
          <div key={m.id} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
            background: m.role === 'user' ? 'var(--color-brand-600)' : 'var(--gray-100)', 
            color: m.role === 'user' ? '#fff' : 'var(--gray-800)', 
            padding: '8px 12px', 
            borderRadius: 12, 
            maxWidth: '70%' 
          }}>
            {m.content}
          </div>
        ))}
        {status === 'streaming' && <div style={{ fontStyle: 'italic', color: 'var(--gray-500)' }}>AI is typing…</div>}
      </div>
      <form onSubmit={e => { 
        e.preventDefault(); 
        if (input.trim()) { 
          send(input.trim()); 
          setInput(''); 
        } 
      }} style={{ display: 'flex', gap: 8 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Ask something..." 
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            borderRadius: 8, 
            border: '1px solid #d0d5dd' 
          }} 
        />
        <Button type="submit" disabled={status === 'thinking' || status === 'streaming'}>
          {status === 'thinking' || status === 'streaming' ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  );
};