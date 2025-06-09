import React from 'react';
import { Card, CardContent, Typography, Alert, Box, Chip } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class RecipeCardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('RecipeCard Error:', error, errorInfo);
    console.error('Recipe data:', this.props.recipe);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for broken recipe cards
      return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom color="error">
              Erreur de Recette
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Cette recette ne peut pas être affichée correctement.
            </Typography>
            
            {/* Show recipe name if available */}
            {this.props.recipe?.name && (
              <Chip 
                label={this.props.recipe.name} 
                color="primary" 
                variant="outlined" 
                sx={{ mb: 1 }}
              />
            )}
            
            {/* Show recipe ID for debugging */}
            {this.props.recipe?.id && (
              <Typography variant="caption" color="text.secondary">
                ID: {this.props.recipe.id}
              </Typography>
            )}
            
            {/* Development mode: Show error details */}
            {process.env.NODE_ENV === 'development' && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                <Typography variant="caption">
                  <strong>Erreur:</strong> {this.state.error?.message}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default RecipeCardErrorBoundary;
