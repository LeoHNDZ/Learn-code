import React from 'react';
import { ChatMessage } from '../../../packages/ai-core/src/types';
import '../../styles/chat.css';

interface MessageBubbleProps { 
  message: ChatMessage; 
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`} data-role={message.role}>
      <div className="bubble__content">{message.content}</div>
    </div>
  );
};