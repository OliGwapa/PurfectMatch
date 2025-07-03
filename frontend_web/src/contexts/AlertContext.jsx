import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Show alert function
  const showAlert = useCallback((type, title, message, duration = 4000) => {
    setAlert({ type, title, message });
    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  }, []);

  // Show confirm dialog function
  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirm({
        ...options,
        onConfirm: () => {
          setConfirm(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirm(null);
          resolve(false);
        }
      });
    });
  }, []);

  // Close alert manually
  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback((title, message, duration) => {
    showAlert('success', title, message, duration);
  }, [showAlert]);

  const showError = useCallback((title, message, duration) => {
    showAlert('error', title, message, duration);
  }, [showAlert]);

  const showWarning = useCallback((title, message, duration) => {
    showAlert('warning', title, message, duration);
  }, [showAlert]);

  const showInfo = useCallback((title, message, duration) => {
    showAlert('info', title, message, duration);
  }, [showAlert]);

  const value = {
    showAlert,
    showConfirm,
    closeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Alert positioned at the top-right */}
      {alert && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 9999 
        }}>
          <CustomAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={closeAlert}
          />
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          isOpen={true}
          title={confirm.title || "Confirm Action"}
          message={confirm.message || "Are you sure you want to proceed?"}
          confirmText={confirm.confirmText || "Confirm"}
          cancelText={confirm.cancelText || "Cancel"}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
          variant={confirm.variant || "default"}
          loading={confirm.loading || false}
          autoFocus={confirm.autoFocus || "cancel"}
        />
      )}
    </AlertContext.Provider>
  );
};