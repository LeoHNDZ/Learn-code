import React from 'react';
import '../../styles/layout.css';
import clsx from 'clsx';

interface NavItemProps { 
  icon: string; 
  label: string; 
  active?: boolean; 
  onClick?: () => void; 
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    className={clsx('nav-item', active && 'active')}
    aria-current={active ? 'page' : undefined}
    onClick={onClick}
  >
    <span className="nav-item__icon" aria-hidden="true">{icon}</span>
    <span className="nav-item__label">{label}</span>
  </button>
);