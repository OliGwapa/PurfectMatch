import React from 'react';
import './CustomAlert.css';

const CustomAlert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = '' 
}) => {
  const getAlertStyles = () => {
    const baseStyles = 'custom-alert';
    switch (type) {
      case 'success':
        return `${baseStyles} custom-alert--success`;
      case 'error':
        return `${baseStyles} custom-alert--error`;
      case 'warning':
        return `${baseStyles} custom-alert--warning`;
      default:
        return `${baseStyles} custom-alert--info`;
    }
  };

  return (
    <div className={`${getAlertStyles()} ${className}`} role="alert">
      <div className="custom-alert__content">
        {title && <h4 className="custom-alert__title">{title}</h4>}
        <p className="custom-alert__message">{message}</p>
      </div>
      {onClose && (
        <button 
          className="custom-alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default CustomAlert;