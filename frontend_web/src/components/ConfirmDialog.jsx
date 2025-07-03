import React, { useState, useEffect, useRef } from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  showIcon = true,
  loading = false,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  autoFocus = 'cancel',
  className = "",
  ...props
}) => {
  const [animationState, setAnimationState] = useState('entering');
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      document.body.style.overflow = 'hidden';
      
      // Start animation
      const timer = setTimeout(() => {
        setAnimationState('entered');
      }, 10);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && animationState === 'entered') {
      // Auto focus
      if (autoFocus === 'confirm' && confirmButtonRef.current) {
        confirmButtonRef.current.focus();
      } else if (autoFocus === 'cancel' && cancelButtonRef.current) {
        cancelButtonRef.current.focus();
      }
    }
  }, [isOpen, animationState, autoFocus]);

  const handleConfirm = () => {
    if (loading) return;
    setAnimationState('exiting');
    setTimeout(() => {
      onConfirm?.();
    }, 300);
  };

  const handleCancel = () => {
    if (loading) return;
    setAnimationState('exiting');
    setTimeout(() => {
      onCancel?.();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleCancel();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape]);

  const getIcon = () => {
    if (!showIcon) return null;

    const iconPaths = {
      default: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z",
      danger: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z",
      info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    };

    return (
      <div className={`confirm-dialog-icon ${variant}`}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[variant]} />
        </svg>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" {...props}>
      <div 
        className={`confirm-dialog-backdrop ${animationState}`}
        onClick={handleBackdropClick}
      />
      
      <div className={`confirm-dialog ${animationState} ${className}`}>
        <div className="confirm-dialog-content">
          {getIcon()}
          
          <h3 className="confirm-dialog-title">
            {title}
          </h3>
          
          <p className="confirm-dialog-message">
            {message}
          </p>
          
          <div className="confirm-dialog-actions">
            <button
              ref={cancelButtonRef}
              onClick={handleCancel}
              className="confirm-dialog-button cancel"
              disabled={loading}
              type="button"
            >
              {cancelText}
            </button>
            
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              className={`confirm-dialog-button confirm ${variant}`}
              disabled={loading}
              type="button"
            >
              {loading ? 'Loading...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;