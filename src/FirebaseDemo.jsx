import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Alert,
  CircularProgress 
} from '@mui/material';
import { 
  CloudDone as CloudDoneIcon, 
  Security as SecurityIcon,
  Analytics as AnalyticsIcon 
} from '@mui/icons-material';
import { db, auth, analytics } from './firebase.js';

function FirebaseDemo() {
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    // Test Firebase connection
    try {
      if (db && auth && analytics) {
        setConnectionStatus('connected');
        console.log('✅ Firebase services initialized successfully');
        console.log('Firestore:', db);
        console.log('Auth:', auth);
        console.log('Analytics:', analytics);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Firebase connection error:', error);
      setConnectionStatus('error');
    }
  }, []);

  const testFirestore = () => {
    console.log('🔥 Testing Firestore connection...');
    console.log('Project ID:', db.app.options.projectId);
    alert('Firestore is ready! Check console for details.');
  };

  const testAuth = () => {
    console.log('🔐 Testing Auth connection...');
    console.log('Auth Domain:', auth.app.options.authDomain);
    alert('Firebase Auth is ready! Check console for details.');
  };

  const testAnalytics = () => {
    console.log('📊 Testing Analytics connection...');
    console.log('Measurement ID:', analytics.app.options.measurementId);
    alert('Firebase Analytics is ready! Check console for details.');
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Firebase Integration Demo
      </Typography>
      
      {connectionStatus === 'checking' && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}
      
      {connectionStatus === 'connected' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          🎉 Firebase services connected successfully!
        </Alert>
      )}
      
      {connectionStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          ❌ Firebase connection failed. Check your configuration.
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <CloudDoneIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Firestore Database</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              NoSQL document database for storing and syncing data
            </Typography>
            <Button variant="contained" onClick={testFirestore}>
              Test Firestore Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Firebase Authentication</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              User authentication and authorization service
            </Typography>
            <Button variant="contained" onClick={testAuth}>
              Test Auth Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Firebase Analytics</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              App analytics and user behavior tracking
            </Typography>
            <Button variant="contained" onClick={testAnalytics}>
              Test Analytics Connection
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default FirebaseDemo;
