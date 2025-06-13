/**
 * Blog Route Handler Component
 * Handles routing between public blog section and authenticated blog management
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicBlogSection from './PublicBlogSection';
import { Box, Button, Typography, Container } from '@mui/material';
import { Login, Dashboard } from '@mui/icons-material';

function BlogRouteHandler({ maxArticles = 20, showHeader = true }) {
  const { currentUser, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Chargement...
        </Typography>
      </Container>
    );
  }

  // For authenticated users, show option to go to blog management
  if (currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Navigation Banner for Authenticated Users */}
        <Box 
          sx={{ 
            mb: 4, 
            p: 3, 
            bgcolor: 'primary.light', 
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'primary.contrastText'
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Bonjour {currentUser.displayName || 'Utilisateur'} !
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Vous consultez les articles publics. Voulez-vous gérer vos propres articles ?
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Dashboard />}
              href="/blog"
              sx={{ color: 'white' }}
            >
              Mes Articles
            </Button>
          </Box>
        </Box>

        {/* Public Blog Content */}
        <PublicBlogSection maxArticles={maxArticles} showHeader={showHeader} />
      </Container>
    );
  }

  // For non-authenticated users, show public blog section with auth prompts
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Public Blog Content */}
      <PublicBlogSection maxArticles={maxArticles} showHeader={showHeader} />
      
      {/* Enhanced Call to Action for Non-Authenticated Users */}
      <Box 
        sx={{ 
          mt: 6, 
          p: 4, 
          bgcolor: 'primary.light', 
          borderRadius: 2, 
          textAlign: 'center',
          color: 'primary.contrastText'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Rejoignez MiamBidi pour créer vos propres articles !
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Inscrivez-vous gratuitement pour accéder à tous nos articles premium, 
          créer vos propres recettes et partager vos expériences culinaires avec notre communauté.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/auth"
            startIcon={<Login />}
            sx={{ color: 'white' }}
          >
            S'inscrire gratuitement
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            href="/auth"
          >
            Se connecter
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default BlogRouteHandler;
