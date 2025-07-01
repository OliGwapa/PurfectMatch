import { useAlert } from '../contexts/AlertContext';

export const useNotifications = () => {
  const { showAlert, showConfirm, showSuccess, showError, showWarning, showInfo } = useAlert();

  // Replacement for window.confirm()
  const confirm = async (message, title = "Confirm Action", options = {}) => {
    return await showConfirm({
      title,
      message,
      confirmText: options.confirmText || "Yes",
      cancelText: options.cancelText || "No",
      variant: options.variant || "warning",
      autoFocus: options.autoFocus || "cancel"
    });
  };

  // Replacement for window.alert() - success
  const alertSuccess = (message, title = "Success") => {
    showSuccess(title, message);
  };

  // Replacement for window.alert() - error
  const alertError = (message, title = "Error") => {
    showError(title, message);
  };

  // Replacement for window.alert() - info
  const alertInfo = (message, title = "Information") => {
    showInfo(title, message);
  };

  // Replacement for window.alert() - warning
  const alertWarning = (message, title = "Warning") => {
    showWarning(title, message);
  };

  // Generic alert
  const alert = (message, title = "Alert", type = "info") => {
    showAlert(type, title, message);
  };

  // Confirm with custom styling for dangerous actions
  const confirmDanger = async (message, title = "Dangerous Action", options = {}) => {
    return await showConfirm({
      title,
      message,
      confirmText: options.confirmText || "Delete",
      cancelText: options.cancelText || "Cancel",
      variant: "danger",
      autoFocus: "cancel",
      ...options
    });
  };

  return {
    // Direct replacements
    confirm,
    alert,
    alertSuccess,
    alertError,
    alertInfo,
    alertWarning,
    confirmDanger,
    
    // Advanced usage
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};