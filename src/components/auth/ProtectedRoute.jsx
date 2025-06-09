import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import FamilySetup from '../family/FamilySetup';

function ProtectedRoute({ children, requireAuth = true, requireFamily = true }) {
  const { currentUser, loading: authLoading } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const location = useLocation();

  const loading = authLoading || familyLoading;

  // Debug logging
  React.useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', {
      path: location.pathname,
      requireAuth,
      requireFamily,
      currentUser: !!currentUser,
      family: !!family,
      authLoading,
      familyLoading,
      loading
    });
  }, [location.pathname, requireAuth, requireFamily, currentUser, family, authLoading, familyLoading, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !currentUser) {
    // Redirect to auth page, saving the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is logged in
  if (!requireAuth && currentUser) {
    // Redirect to dashboard or the intended destination
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // If family is required but user doesn't have one, show family setup
  if (requireAuth && currentUser && requireFamily && !family) {
    return <FamilySetup />;
  }

  // Render the protected content
  return children;
}

export default ProtectedRoute;
