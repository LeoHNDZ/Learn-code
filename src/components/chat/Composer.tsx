'use client';
import React, { useCallback } from 'react';
import '../../styles/chat.css';
import { Button } from '../ui/ButtonNew';

interface ComposerProps { 
  value: string; 
  onChange: (v: string) => void; 
  onSubmit: () => void; 
  disabled?: boolean; 
}

export const Composer: React.FC<ComposerProps> = ({ value, onChange, onSubmit, disabled }) => {
  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      onSubmit(); 
    }
  }, [onSubmit]);
  
  return (
    <div className="composer">
      <textarea
        className="composer__input"
        placeholder="Ask a question… (Shift+Enter for new line)"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        rows={1}
      />
      <div className="composer__actions">
        <Button 
          type="button" 
          onClick={onSubmit} 
          disabled={disabled || !value.trim()} 
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  );
};