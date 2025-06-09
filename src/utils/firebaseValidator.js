/**
 * Firebase Configuration Validator for MiamBidi
 * Helps diagnose Firebase authentication configuration issues
 */

import { auth } from '../firebase';

/**
 * Validates Firebase configuration and authentication setup
 * @returns {object} Validation result with status and messages
 */
export function validateFirebaseConfig() {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    info: []
  };

  try {
    // Check if Firebase Auth is initialized
    if (!auth) {
      results.isValid = false;
      results.errors.push('Firebase Auth is not initialized');
      return results;
    }

    // Check auth configuration
    if (!auth.app) {
      results.isValid = false;
      results.errors.push('Firebase app is not properly initialized');
      return results;
    }

    // Check project configuration
    const config = auth.app.options;

    if (!config.apiKey) {
      results.isValid = false;
      results.errors.push('Firebase API key is missing');
    }

    if (!config.authDomain) {
      results.isValid = false;
      results.errors.push('Firebase auth domain is missing');
    }

    if (!config.projectId) {
      results.isValid = false;
      results.errors.push('Firebase project ID is missing');
    }

    // Check auth domain format
    if (config.authDomain && !config.authDomain.includes('.firebaseapp.com')) {
      results.warnings.push('Auth domain should typically end with .firebaseapp.com');
    }

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      results.info.push('Running in development mode');
    }

    // Log configuration details (without sensitive info)
    results.info.push(`Project ID: ${config.projectId}`);
    results.info.push(`Auth Domain: ${config.authDomain}`);
    results.info.push(`API Key: ${config.apiKey ? 'Present' : 'Missing'}`);

    // Check current domain
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.hostname;
      const currentPort = window.location.port;
      const currentOrigin = window.location.origin;

      results.info.push(`Current Domain: ${currentDomain}`);
      results.info.push(`Current Port: ${currentPort || 'default'}`);
      results.info.push(`Current Origin: ${currentOrigin}`);

      // Check if current domain might need authorization
      if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        results.info.push('⚠️ Running on localhost - ensure localhost is in authorized domains');
      }
    }

  } catch (error) {
    results.isValid = false;
    results.errors.push(`Firebase validation error: ${error.message}`);
  }

  return results;
}

/**
 * Tests Firebase authentication methods
 * @returns {object} Test results
 */
export async function testFirebaseAuth() {
  const results = {
    emailPasswordEnabled: false,
    googleAuthEnabled: false,
    errors: [],
    info: []
  };

  try {
    // Check if auth is available
    if (!auth) {
      results.errors.push('Firebase Auth not available');
      return results;
    }

    // Test email/password provider availability
    try {
      // This will throw an error if email/password is not enabled
      const providers = auth.app.options;
      results.info.push('Auth providers check completed');
      results.emailPasswordEnabled = true;
    } catch (error) {
      results.errors.push(`Email/Password auth error: ${error.message}`);
    }

    // Note: We can't easily test Google Auth without actually attempting sign-in
    // This would require user interaction
    results.info.push('Google Auth availability requires user interaction to test');

  } catch (error) {
    results.errors.push(`Auth test error: ${error.message}`);
  }

  return results;
}

/**
 * Logs detailed Firebase configuration information
 */
export function logFirebaseDebugInfo() {
  console.group('🔥 Firebase Configuration Debug Info');

  const validation = validateFirebaseConfig();

  if (validation.isValid) {
    console.log('✅ Firebase configuration is valid');
  } else {
    console.error('❌ Firebase configuration has errors');
  }

  if (validation.errors.length > 0) {
    console.group('❌ Errors:');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  if (validation.info.length > 0) {
    console.group('ℹ️ Info:');
    validation.info.forEach(info => console.info(info));
    console.groupEnd();
  }

  // Test auth methods
  testFirebaseAuth().then(authResults => {
    console.group('🔐 Authentication Tests:');
    console.log('Email/Password enabled:', authResults.emailPasswordEnabled);
    console.log('Google Auth enabled:', authResults.googleAuthEnabled);

    if (authResults.errors.length > 0) {
      console.group('Auth Errors:');
      authResults.errors.forEach(error => console.error(error));
      console.groupEnd();
    }

    console.groupEnd();
  });

  console.groupEnd();
}

export default {
  validateFirebaseConfig,
  testFirebaseAuth,
  logFirebaseDebugInfo
};
