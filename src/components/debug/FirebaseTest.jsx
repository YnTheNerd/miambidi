/**
 * Firebase Configuration Test Component
 * Helps diagnose Firebase authentication issues
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh
} from '@mui/icons-material';
import { validateFirebaseConfig, testFirebaseAuth } from '../../utils/firebaseValidator';
import { auth } from '../../firebase';

function FirebaseTest() {
  const [configStatus, setConfigStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);

    try {
      // Test configuration
      const configResults = validateFirebaseConfig();
      setConfigStatus(configResults);

      // Test authentication
      const authResults = await testFirebaseAuth();
      setAuthStatus(authResults);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (isValid, hasErrors, hasWarnings) => {
    if (hasErrors) return <Error color="error" />;
    if (hasWarnings) return <Warning color="warning" />;
    if (isValid) return <CheckCircle color="success" />;
    return <Info color="info" />;
  };

  const testEmailAuth = async () => {
    try {
      console.log('🧪 Testing email authentication...');
      console.log('Auth object:', auth);
      console.log('Auth app:', auth?.app);
      console.log('Auth config:', auth?.app?.options);

      // Test if we can access auth methods
      console.log('Available auth methods:');
      console.log('- signInWithEmailAndPassword:', typeof auth.signInWithEmailAndPassword);
      console.log('- createUserWithEmailAndPassword:', typeof auth.createUserWithEmailAndPassword);
      console.log('- signInWithPopup:', typeof auth.signInWithPopup);

      // Check current auth state
      console.log('Current user:', auth.currentUser);
      console.log('Auth ready:', !!auth);

    } catch (error) {
      console.error('❌ Email auth test error:', error);
    }
  };

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 Testing Google authentication setup...');

      // Import GoogleAuthProvider to test
      const { GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();

      console.log('✅ GoogleAuthProvider created successfully');
      console.log('Provider:', provider);

    } catch (error) {
      console.error('❌ Google auth test error:', error);
    }
  };

  const checkAuthState = () => {
    console.log('🔍 Current authentication state:');
    console.log('- Auth object exists:', !!auth);
    console.log('- Current user:', auth?.currentUser);
    console.log('- Auth ready:', auth?._delegate?._isInitialized);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🔥 Firebase Configuration Test
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Cette page aide à diagnostiquer les problèmes de configuration Firebase.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={runTests}
            disabled={loading}
          >
            {loading ? 'Test en cours...' : 'Relancer les tests'}
          </Button>

          <Button
            variant="outlined"
            onClick={testEmailAuth}
          >
            Test Email Auth
          </Button>

          <Button
            variant="outlined"
            onClick={testGoogleAuth}
          >
            Test Google Auth
          </Button>

          <Button
            variant="outlined"
            onClick={checkAuthState}
          >
            Check Auth State
          </Button>
        </Box>

        {/* Configuration Status */}
        {configStatus && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuration Firebase
            </Typography>

            <Alert
              severity={configStatus.isValid ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {configStatus.isValid
                ? 'Configuration Firebase valide ✅'
                : 'Problèmes de configuration détectés ❌'
              }
            </Alert>

            {configStatus.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Erreurs:
                </Typography>
                <List dense>
                  {configStatus.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {configStatus.warnings.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Avertissements:
                </Typography>
                <List dense>
                  {configStatus.warnings.map((warning, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {configStatus.info.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Informations:
                </Typography>
                <List dense>
                  {configStatus.info.map((info, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText primary={info} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Authentication Status */}
        {authStatus && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tests d'authentification
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  {getStatusIcon(authStatus.emailPasswordEnabled, authStatus.errors.length > 0, false)}
                </ListItemIcon>
                <ListItemText
                  primary="Email/Password"
                  secondary={authStatus.emailPasswordEnabled ? 'Activé' : 'Désactivé ou erreur'}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Info color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Google OAuth"
                  secondary="Test nécessite une interaction utilisateur"
                />
              </ListItem>
            </List>

            {authStatus.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Erreurs d'authentification:
                </Typography>
                <List dense>
                  {authStatus.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Quick Actions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Actions rapides
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Si vous rencontrez des problèmes:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemText
                primary="1. Vérifiez la console du navigateur"
                secondary="Ouvrez les outils de développement et regardez les messages d'erreur"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Vérifiez la configuration Firebase Console"
                secondary="Assurez-vous que l'authentification est activée"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Vérifiez les domaines autorisés"
                secondary="localhost doit être dans la liste des domaines autorisés"
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

export default FirebaseTest;
