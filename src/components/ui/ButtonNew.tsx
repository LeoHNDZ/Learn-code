import React from 'react';
import '../../styles/buttons.css';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...rest }) => {
  return (
    <button className={clsx('button', variant === 'secondary' && 'button--secondary', className)} {...rest}>
      {children}
    </button>
  );
};