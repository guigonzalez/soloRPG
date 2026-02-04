import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`retro-card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {title && <div className="retro-card-title">{title}</div>}
      {children}
    </div>
  );
}
