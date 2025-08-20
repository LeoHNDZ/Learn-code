import React from 'react';
import '../../styles/chat.css';

export const TypingIndicator: React.FC = () => (
  <div className="typing-indicator" aria-live="assertive" aria-label="Assistant is typing">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </div>
);