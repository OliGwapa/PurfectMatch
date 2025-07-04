import React from 'react';
import "./Button.css";

const Button = ({ 
  children, 
  icon: Icon, 
  iconPosition = 'left', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`custom-button ${disabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  );
};

export default Button;