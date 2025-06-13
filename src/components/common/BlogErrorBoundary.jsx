/**
 * Blog Error Boundary Component
 * Handles React DevTools communication errors and other blog-related errors
 */

import React from 'react';
import { Box, Typography, Button, Alert, Container } from '@mui/material';
import { Refresh, Warning } from '@mui/icons-material';

class BlogErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isDevToolsError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a React DevTools communication error
    const isDevToolsError = 
      error.message?.includes('disconnected port object') ||
      error.message?.includes('postMessage') ||
      error.message?.includes('handleMessageFromPage') ||
      error.stack?.includes('react-devtools') ||
      error.stack?.includes('bridge.js');

    return { 
      hasError: true,
      isDevToolsError
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('BlogErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // If it's a DevTools error, try to recover automatically
    if (this.state.isDevToolsError) {
      console.warn('React DevTools communication error detected. Attempting recovery...');
      
      // Attempt to recover after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 1000);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isDevToolsError: false
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // For DevTools errors, show a minimal recovery interface
      if (this.state.isDevToolsError) {
        return (
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={this.handleRetry}>
                  Réessayer
                </Button>
              }
            >
              <Typography variant="body2">
                Problème de communication détecté. Récupération en cours...
              </Typography>
            </Alert>
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chargement du contenu...
              </Typography>
              <Button 
                variant="outlined" 
                onClick={this.handleRetry}
                sx={{ mt: 2 }}
              >
                Continuer
              </Button>
            </Box>
          </Container>
        );
      }

      // For other errors, show a more detailed error page
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Warning color="warning" sx={{ fontSize: 64, mb: 2 }} />
            
            <Typography variant="h4" gutterBottom>
              Oups ! Une erreur s'est produite
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Nous rencontrons un problème temporaire avec le chargement du blog.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
              <Button 
                variant="contained" 
                onClick={this.handleRetry}
                startIcon={<Refresh />}
              >
                Réessayer
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={this.handleRefresh}
              >
                Actualiser la page
              </Button>
            </Box>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ textAlign: 'left', mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Détails de l'erreur (développement uniquement):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.7rem', mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default BlogErrorBoundary;
