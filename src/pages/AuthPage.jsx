/**
 * Authentication Page for MiamBidi
 * Manages login, signup, and password reset flows
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const AUTH_MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT_PASSWORD: 'forgot-password'
};

function AuthPage() {
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSwitchToSignup = () => {
    setAuthMode(AUTH_MODES.SIGNUP);
  };

  const handleSwitchToLogin = () => {
    setAuthMode(AUTH_MODES.LOGIN);
  };

  const handleForgotPassword = () => {
    setAuthMode(AUTH_MODES.FORGOT_PASSWORD);
  };

  const renderAuthForm = () => {
    switch (authMode) {
      case AUTH_MODES.SIGNUP:
        return <SignupForm onSwitchToLogin={handleSwitchToLogin} />;
      case AUTH_MODES.FORGOT_PASSWORD:
        return <ForgotPasswordForm onBackToLogin={handleSwitchToLogin} />;
      default:
        return (
          <LoginForm
            onSwitchToSignup={handleSwitchToSignup}
            onForgotPassword={handleForgotPassword}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            {!isMobile && (
              <>
                <Slide direction="down" in={true} timeout={600}>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      animation: 'slideInDown 0.8s ease-out',
                    }}
                  >
                    Bienvenue sur MiamBidi
                  </Typography>
                </Slide>

                <Fade in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      opacity: 0.9,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      mb: 3,
                      animation: 'slideInUp 0.8s ease-out 0.3s both',
                    }}
                  >
                    Votre assistant culinaire intelligent pour planifier vos repas en famille
                  </Typography>
                </Fade>
              </>
            )}
          </Box>
        </Fade>

        <Zoom in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
          <Box
            sx={{
              animation: 'fadeInScale 0.8s ease-out 0.6s both',
            }}
          >
            {renderAuthForm()}
          </Box>
        </Zoom>

        {/* Features Preview */}
        {authMode === AUTH_MODES.LOGIN && !isMobile && (
          <Fade in={true} timeout={1000} style={{ transitionDelay: '900ms' }}>
            <Box
              sx={{
                mt: 4,
                textAlign: 'center',
                animation: 'slideInUp 0.8s ease-out 0.9s both',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  opacity: 0.8,
                  mb: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                ✨ Planification de repas • 🛒 Listes de courses automatiques • 👨‍👩‍👧‍👦 Gestion familiale
              </Typography>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

export default AuthPage;
