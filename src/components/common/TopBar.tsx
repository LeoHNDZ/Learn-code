import React from 'react';
import '../../styles/layout.css';

interface TopBarProps { 
  onToggleChat: () => void; 
  chatOpen: boolean; 
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleChat, chatOpen }) => (
  <header className="topbar" role="banner">
    <div className="topbar__left">
      <h1 className="topbar__title">Learn Code</h1>
    </div>
    <div className="topbar__center">
      <input 
        type="search" 
        placeholder="Search ( / ) or Command Palette (⌘K)" 
        className="topbar__search" 
        aria-label="Search" 
      />
    </div>
    <div className="topbar__right">
      <button className="button button--secondary" onClick={onToggleChat}>
        {chatOpen ? 'Hide Chat' : 'Show Chat'}
      </button>
      <button className="icon-btn" aria-label="Toggle Theme">🌓</button>
      <button className="icon-btn" aria-label="Profile">👤</button>
    </div>
  </header>
);