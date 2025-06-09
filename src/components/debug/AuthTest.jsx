/**
 * Authentication Test Component for MiamBidi
 * Tests authentication flow, logout functionality, and session management
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
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Info,
  Login,
  Logout,
  Security,
  Refresh,
  Person,
  VpnKey
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useNavigate } from 'react-router-dom';

function AuthTest() {
  const { currentUser, userProfile, loading, logout } = useAuth();
  const { family } = useFamily();
  const navigate = useNavigate();
  
  const [testResults, setTestResults] = useState([]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [authState, setAuthState] = useState({});

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Monitor authentication state changes
  useEffect(() => {
    setAuthState({
      isAuthenticated: !!currentUser,
      hasProfile: !!userProfile,
      hasFamily: !!family,
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || null,
      timestamp: new Date().toISOString()
    });
  }, [currentUser, userProfile, family]);

  const testLogout = async () => {
    setIsTestingAuth(true);
    addTestResult('🧪 Testing logout functionality...', 'info');
    
    try {
      // Check initial state
      if (!currentUser) {
        addTestResult('❌ No user logged in to test logout', 'error');
        return;
      }

      addTestResult(`📝 User before logout: ${currentUser.email}`, 'info');
      
      // Perform logout
      await logout();
      
      // Check if logout was successful
      setTimeout(() => {
        if (!currentUser) {
          addTestResult('✅ Logout successful - user cleared from context', 'success');
        } else {
          addTestResult('❌ Logout failed - user still in context', 'error');
        }
      }, 1000);
      
    } catch (error) {
      addTestResult(`❌ Logout error: ${error.message}`, 'error');
    } finally {
      setIsTestingAuth(false);
    }
  };

  const testProtectedRouteAccess = () => {
    addTestResult('🧪 Testing protected route access...', 'info');
    
    if (currentUser) {
      addTestResult('⚠️ User is logged in. Logout first to test protected route redirect.', 'warning');
    } else {
      addTestResult('📍 Attempting to access protected route /dashboard...', 'info');
      navigate('/dashboard');
    }
  };

  const testSessionPersistence = () => {
    addTestResult('🧪 Testing session persistence...', 'info');
    
    // Check localStorage for Firebase auth data
    const firebaseKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('firebase:')) {
        firebaseKeys.push(key);
      }
    }
    
    if (firebaseKeys.length > 0) {
      addTestResult(`📦 Found ${firebaseKeys.length} Firebase localStorage items`, 'info');
      firebaseKeys.forEach(key => {
        addTestResult(`   - ${key}`, 'info');
      });
    } else {
      addTestResult('📦 No Firebase localStorage items found', 'info');
    }
    
    // Check sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    if (sessionKeys.length > 0) {
      addTestResult(`📦 Found ${sessionKeys.length} sessionStorage items`, 'info');
    } else {
      addTestResult('📦 SessionStorage is clean', 'success');
    }
  };

  const testAuthStateConsistency = () => {
    addTestResult('🧪 Testing auth state consistency...', 'info');
    
    const checks = [
      {
        name: 'User Context',
        value: !!currentUser,
        expected: true,
        description: 'currentUser should be available'
      },
      {
        name: 'User Profile',
        value: !!userProfile,
        expected: true,
        description: 'userProfile should be loaded'
      },
      {
        name: 'Family Context',
        value: !!family,
        expected: true,
        description: 'family should be available for authenticated users'
      }
    ];
    
    checks.forEach(check => {
      if (currentUser) {
        const status = check.value === check.expected ? '✅' : '❌';
        addTestResult(`${status} ${check.name}: ${check.value} (${check.description})`, 
          check.value === check.expected ? 'success' : 'error');
      }
    });
    
    if (!currentUser) {
      addTestResult('ℹ️ No user logged in - cannot test auth state consistency', 'info');
    }
  };

  const clearAllData = () => {
    addTestResult('🧪 Clearing all cached data...', 'info');
    
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    addTestResult(`✅ Cleared ${keysToRemove.length} localStorage items and all sessionStorage`, 'success');
    addTestResult('🔄 Refresh the page to see if authentication persists', 'info');
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'warning': return <Error color="warning" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔐 Authentication System Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Testez le système d'authentification, la déconnexion et la gestion des sessions.
      </Typography>

      {/* Current Authentication Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            État Actuel de l'Authentification
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person />
                <Typography variant="subtitle2">Utilisateur:</Typography>
                <Chip 
                  label={currentUser ? 'Connecté' : 'Déconnecté'} 
                  color={currentUser ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              {currentUser && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Email: {currentUser.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nom: {currentUser.displayName || 'Non défini'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    UID: {currentUser.uid}
                  </Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Security />
                <Typography variant="subtitle2">Profil:</Typography>
                <Chip 
                  label={userProfile ? 'Chargé' : 'Non chargé'} 
                  color={userProfile ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <VpnKey />
                <Typography variant="subtitle2">Famille:</Typography>
                <Chip 
                  label={family ? 'Configurée' : 'Non configurée'} 
                  color={family ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Chargement...</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tests d'Authentification
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={testLogout}
                disabled={isTestingAuth || !currentUser}
                startIcon={<Logout />}
                size="small"
                color="error"
              >
                Tester Déconnexion
              </Button>
              
              <Button
                variant="outlined"
                onClick={testProtectedRouteAccess}
                disabled={isTestingAuth}
                startIcon={<Security />}
                size="small"
              >
                Tester Route Protégée
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tests de Session
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={testSessionPersistence}
                disabled={isTestingAuth}
                startIcon={<Info />}
                size="small"
              >
                Vérifier Persistance
              </Button>
              
              <Button
                variant="outlined"
                onClick={testAuthStateConsistency}
                disabled={isTestingAuth}
                startIcon={<CheckCircle />}
                size="small"
              >
                Vérifier Cohérence
              </Button>
              
              <Button
                variant="outlined"
                onClick={clearAllData}
                disabled={isTestingAuth}
                startIcon={<Refresh />}
                size="small"
                color="warning"
              >
                Effacer Données
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Test Results */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Résultats des Tests
            </Typography>
            <Button
              variant="text"
              onClick={clearResults}
              size="small"
              startIcon={<Refresh />}
            >
              Effacer
            </Button>
          </Box>
          
          {testResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun test exécuté. Utilisez les boutons ci-dessus pour tester.
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
        </CardContent>
      </Card>
    </Box>
  );
}

export default AuthTest;
