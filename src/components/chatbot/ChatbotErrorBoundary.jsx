/**
 * Chatbot Error Boundary Component for MiamBidi
 * Handles errors in the chatbot components gracefully
 */

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  SmartToy
} from '@mui/icons-material';

class ChatbotErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Chatbot Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: { xs: '100vw', sm: '400px' },
            height: '100vh',
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: { xs: 0, sm: '16px 0 0 16px' }
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#d32f2f',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ErrorOutline />
            <Typography variant="h6">
              Erreur Assistant Culinaire
            </Typography>
          </Box>

          {/* Error Content */}
          <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="error">
              <AlertTitle>Oups ! Un problème technique</AlertTitle>
              L'assistant culinaire a rencontré une erreur inattendue.
            </Alert>

            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SmartToy sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Assistant temporairement indisponible
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Comme dirait Samuel Eto'o, parfois il faut marquer un temps d'arrêt ! ⚽
                <br />
                Nos circuits ont besoin d'un petit café camerounais ! ☕
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                sx={{ 
                  bgcolor: '#2E7D32',
                  '&:hover': { bgcolor: '#1B5E20' }
                }}
              >
                Réessayer
              </Button>
            </Box>

            {/* Fallback suggestions */}
            <Alert severity="info">
              <AlertTitle>En attendant, vous pouvez :</AlertTitle>
              • Naviguer dans l'application normalement<br />
              • Consulter vos recettes et votre garde-manger<br />
              • Réessayer l'assistant dans quelques minutes
            </Alert>

            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Informations de débogage:
                </Typography>
                <Paper sx={{ p: 1, bgcolor: 'grey.100', mt: 1 }}>
                  <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ChatbotErrorBoundary;
