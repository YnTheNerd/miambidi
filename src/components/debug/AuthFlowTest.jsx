/**
 * Authentication Flow Test Component
 * Tests actual sign-in and sign-up flows
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Email,
  Google,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function AuthFlowTest() {
  const { 
    signup, 
    signin, 
    signInWithGoogle, 
    logout, 
    currentUser, 
    error, 
    loading 
  } = useAuth();

  const [testResults, setTestResults] = useState([]);
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@miambidi.com',
    password: 'testpassword123'
  });
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testEmailSignup = async () => {
    setIsTestingEmail(true);
    addTestResult('🧪 Testing email signup...', 'info');
    
    try {
      await signup(testCredentials.email, testCredentials.password, {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User'
      });
      addTestResult('✅ Email signup successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Email signup failed: ${error.message}`, 'error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const testEmailSignin = async () => {
    setIsTestingEmail(true);
    addTestResult('🧪 Testing email signin...', 'info');
    
    try {
      await signin(testCredentials.email, testCredentials.password);
      addTestResult('✅ Email signin successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Email signin failed: ${error.message}`, 'error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const testGoogleSignin = async () => {
    setIsTestingGoogle(true);
    addTestResult('🧪 Testing Google signin...', 'info');
    
    try {
      await signInWithGoogle();
      addTestResult('✅ Google signin successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Google signin failed: ${error.message}`, 'error');
    } finally {
      setIsTestingGoogle(false);
    }
  };

  const testLogout = async () => {
    addTestResult('🧪 Testing logout...', 'info');
    
    try {
      await logout();
      addTestResult('✅ Logout successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Logout failed: ${error.message}`, 'error');
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🔐 Authentication Flow Test
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Testez les flux d'authentification réels avec email/password et Google OAuth.
        </Typography>

        {/* Current User Status */}
        <Alert 
          severity={currentUser ? 'success' : 'info'} 
          sx={{ mb: 3 }}
        >
          {currentUser 
            ? `✅ Utilisateur connecté: ${currentUser.email} (${currentUser.displayName || 'Nom non défini'})`
            : '❌ Aucun utilisateur connecté'
          }
        </Alert>

        {/* Global Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erreur globale: {error}
          </Alert>
        )}

        {/* Test Credentials */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Identifiants de test
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Email de test"
              value={testCredentials.email}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Mot de passe de test"
              type="password"
              value={testCredentials.password}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Test Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={isTestingEmail ? <CircularProgress size={20} /> : <Email />}
            onClick={testEmailSignup}
            disabled={isTestingEmail || loading || currentUser}
          >
            Test Email Signup
          </Button>

          <Button
            variant="outlined"
            startIcon={isTestingEmail ? <CircularProgress size={20} /> : <Email />}
            onClick={testEmailSignin}
            disabled={isTestingEmail || loading || currentUser}
          >
            Test Email Signin
          </Button>

          <Button
            variant="outlined"
            startIcon={isTestingGoogle ? <CircularProgress size={20} /> : <Google />}
            onClick={testGoogleSignin}
            disabled={isTestingGoogle || loading || currentUser}
          >
            Test Google Signin
          </Button>

          <Button
            variant="text"
            onClick={testLogout}
            disabled={loading || !currentUser}
            color="error"
          >
            Test Logout
          </Button>

          <Button
            variant="text"
            onClick={clearResults}
            size="small"
          >
            Clear Results
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Test Results */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Résultats des tests
          </Typography>
          
          {testResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun test exécuté. Cliquez sur un bouton de test ci-dessus.
            </Typography>
          ) : (
            <List dense>
              {testResults.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getResultIcon(result.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={result.message}
                    secondary={result.timestamp}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Instructions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Instructions de test
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pour tester l'authentification:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText 
                primary="1. Test Email Signup"
                secondary="Crée un nouveau compte avec l'email et mot de passe de test"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Test Email Signin"
                secondary="Se connecte avec un compte existant (après signup)"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Test Google Signin"
                secondary="Ouvre une popup Google pour l'authentification OAuth"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="4. Test Logout"
                secondary="Déconnecte l'utilisateur actuel"
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

export default AuthFlowTest;
