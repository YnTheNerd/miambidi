/**
 * React DevTools Error Handler
 * Handles disconnected port object errors and other DevTools communication issues
 */

import React from 'react';

/**
 * Check if an error is related to React DevTools communication
 */
export function isDevToolsError(error) {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const errorStack = error.stack || '';
  
  return (
    errorMessage.includes('disconnected port object') ||
    errorMessage.includes('postMessage') ||
    errorMessage.includes('handleMessageFromPage') ||
    errorMessage.includes('Attempting to use a disconnected port object') ||
    errorStack.includes('react-devtools') ||
    errorStack.includes('bridge.js') ||
    errorStack.includes('chrome-extension://') ||
    errorStack.includes('moz-extension://')
  );
}

/**
 * Safely handle DevTools errors without crashing the app
 */
export function handleDevToolsError(error, context = 'Unknown') {
  if (isDevToolsError(error)) {
    console.warn(`[DevTools Error Handler] ${context}:`, error.message);
    
    // Don't throw or propagate DevTools errors
    return true;
  }
  
  // Not a DevTools error, let it propagate normally
  return false;
}

/**
 * Install global error handlers for DevTools communication issues
 */
export function installDevToolsErrorHandlers() {
  try {
    // Prevent multiple installations
    if (window.__devToolsErrorHandlersInstalled) {
      return;
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      try {
        if (handleDevToolsError(event.reason, 'Unhandled Promise Rejection')) {
          event.preventDefault();
        }
      } catch (error) {
        // Silently fail to avoid breaking the app
        console.warn('[DevTools Error Handler] Error in unhandledrejection handler:', error.message);
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      try {
        if (handleDevToolsError(event.error, 'Global Error')) {
          event.preventDefault();
        }
      } catch (error) {
        // Silently fail to avoid breaking the app
        console.warn('[DevTools Error Handler] Error in global error handler:', error.message);
      }
    });

    // Handle React error boundary errors (safer approach)
    try {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        try {
          const firstArg = args[0];

          // Check if this is a React error that might be DevTools related
          if (typeof firstArg === 'string' &&
              (firstArg.includes('React') || firstArg.includes('component')) &&
              args.some(arg => typeof arg === 'object' && arg && isDevToolsError(arg))) {

            console.warn('[DevTools Error Handler] Suppressed React DevTools error:', firstArg);
            return;
          }

          // Call original console.error for non-DevTools errors
          originalConsoleError.apply(console, args);
        } catch (error) {
          // Fallback to original console.error if our handler fails
          originalConsoleError.apply(console, args);
        }
      };
    } catch (error) {
      console.warn('[DevTools Error Handler] Could not override console.error:', error.message);
    }

    // Mark as installed
    window.__devToolsErrorHandlersInstalled = true;
    console.log('[DevTools Error Handler] Global error handlers installed successfully');
  } catch (error) {
    console.warn('[DevTools Error Handler] Failed to install error handlers:', error.message);
    // Don't throw the error to avoid breaking the app
  }
}

/**
 * Create a safe wrapper for async functions that might trigger DevTools errors
 */
export function safeAsync(asyncFn, context = 'Async Function') {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      if (handleDevToolsError(error, context)) {
        // DevTools error handled, return undefined or default value
        return undefined;
      }
      
      // Re-throw non-DevTools errors
      throw error;
    }
  };
}

/**
 * Create a safe wrapper for React components that might trigger DevTools errors
 */
export function safeComponent(Component, displayName = 'SafeComponent') {
  const SafeWrapper = (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      if (handleDevToolsError(error, `Component: ${displayName}`)) {
        // Return a minimal fallback for DevTools errors
        return (
          <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
            Chargement...
          </div>
        );
      }
      
      // Re-throw non-DevTools errors
      throw error;
    }
  };
  
  SafeWrapper.displayName = displayName;
  return SafeWrapper;
}

/**
 * Debounced function to prevent rapid successive DevTools errors
 */
let devToolsErrorCount = 0;
let lastDevToolsError = 0;

export function throttleDevToolsErrors(fn, delay = 1000) {
  return (...args) => {
    const now = Date.now();
    
    if (now - lastDevToolsError > delay) {
      devToolsErrorCount = 0;
    }
    
    if (devToolsErrorCount < 3) {
      devToolsErrorCount++;
      lastDevToolsError = now;
      return fn(...args);
    }
    
    // Too many DevTools errors, suppress
    console.warn('[DevTools Error Handler] Throttling DevTools errors');
  };
}
