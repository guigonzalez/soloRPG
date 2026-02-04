import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        className={`retro-input ${className}`}
        {...props}
      />
    </div>
  );
}
