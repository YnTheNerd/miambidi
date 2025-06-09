/**
 * Notification Context for MiamBidi
 * Manages toast notifications and alerts
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  /**
   * Shows a notification
   * @param {string} message - Notification message
   * @param {string} severity - Severity level ('success', 'error', 'warning', 'info')
   * @param {string} title - Optional title
   * @param {number} duration - Auto-hide duration in milliseconds (0 for no auto-hide)
   */
  const showNotification = useCallback((message, severity = 'info', title = null, duration = 6000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      severity,
      title,
      duration,
      open: true
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-hide notification if duration is set
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Hides a specific notification
   * @param {number} id - Notification ID
   */
  const hideNotification = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, open: false }
          : notification
      )
    );

    // Remove notification after animation
    setTimeout(() => {
      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
    }, 300);
  }, []);

  /**
   * Clears all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different severity levels
  const showSuccess = useCallback((message, title = null, duration = 4000) => {
    return showNotification(message, 'success', title, duration);
  }, [showNotification]);

  const showError = useCallback((message, title = null, duration = 8000) => {
    return showNotification(message, 'error', title, duration);
  }, [showNotification]);

  const showWarning = useCallback((message, title = null, duration = 6000) => {
    return showNotification(message, 'warning', title, duration);
  }, [showNotification]);

  const showInfo = useCallback((message, title = null, duration = 6000) => {
    return showNotification(message, 'info', title, duration);
  }, [showNotification]);

  const value = {
    // State
    notifications,

    // Methods
    showNotification,
    hideNotification,
    clearAllNotifications,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }} // Account for app bar
        >
          <Alert
            onClose={() => hideNotification(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%', minWidth: 300 }}
          >
            {notification.title && (
              <AlertTitle>{notification.title}</AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
export default NotificationContext;
