'use client';
import React, { Suspense, useState, useCallback } from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopBar } from '../components/common/TopBar';
import { ChatPanel } from '../components/chat/ChatPanel';
import '../styles/layout.css';

interface AppShellProps { 
  children: React.ReactNode; 
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(true);
  const toggleChat = useCallback(() => setChatOpen(o => !o), []);
  
  return (
    <div className="app-shell">
      <Sidebar onToggleChat={toggleChat} chatOpen={chatOpen} />
      <div className="app-main">
        <TopBar onToggleChat={toggleChat} chatOpen={chatOpen} />
        <main className="content-area" role="main" aria-label="Main Content">
          {children}
        </main>
      </div>
      <Suspense fallback={<div className="chat-panel--loading">Loading chat…</div>}>
        <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      </Suspense>
    </div>
  );
};