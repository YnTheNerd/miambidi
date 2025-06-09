/**
 * Login Form Component for MiamBidi
 * Handles email/password and Google authentication
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm({ onSwitchToSignup, onForgotPassword }) {
  const { signin, signInWithGoogle, error, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Adresse email invalide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await signin(formData.email, formData.password);
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connexion
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          name="email"
          type="email"
          label="Adresse email"
          value={formData.email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          autoComplete="email"
          autoFocus
        />

        <TextField
          fullWidth
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting || loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Se connecter'
          )}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          ou
        </Typography>
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<Google />}
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || loading}
        sx={{ mb: 3 }}
      >
        Continuer avec Google
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={onForgotPassword}
          sx={{ display: 'block', mb: 1 }}
        >
          Mot de passe oublié ?
        </Link>
        
        <Typography variant="body2" color="text.secondary">
          Pas encore de compte ?{' '}
          <Link component="button" onClick={onSwitchToSignup}>
            S'inscrire
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default LoginForm;
