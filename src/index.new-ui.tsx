import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './layout/AppShell';
import './styles/layout.css';
import './styles/chat.css';

function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>Select a lesson or open the chat to get started.</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <Home />
    </AppShell>
  </React.StrictMode>
);