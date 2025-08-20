import React from 'react';
import '../../styles/layout.css';
import { NavItem } from './SidebarNavItem';

interface SidebarProps { 
  onToggleChat: () => void; 
  chatOpen: boolean; 
}

const NAV_ITEMS = [
  { id: 'learn', label: 'Learn', icon: '📘' },
  { id: 'practice', label: 'Practice', icon: '🧪' },
  { id: 'history', label: 'History', icon: '🕑' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onToggleChat, chatOpen }) => (
  <nav className="sidebar" aria-label="Primary">
    <div className="sidebar__logo">LC</div>
    <div className="sidebar__nav">
      {NAV_ITEMS.map(item => (
        <NavItem key={item.id} icon={item.icon} label={item.label} active={item.id === 'learn'} />
      ))}
      <button
        className={`nav-item ${chatOpen ? 'active' : ''}`}
        onClick={onToggleChat}
        aria-pressed={chatOpen}
        aria-label="Toggle Chat Panel"
      >
        <span className="nav-item__icon">💬</span>
        <span className="nav-item__label">Chat</span>
      </button>
    </div>
    <div className="sidebar__bottom">
      <NavItem icon="⚙️" label="Settings" />
    </div>
  </nav>
);