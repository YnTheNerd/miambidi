/**
 * Signup Form Component for MiamBidi
 * Handles user registration with email/password and Google
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
  IconButton,
  Grid
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Google
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function SignupForm({ onSwitchToLogin }) {
  const { signup, signInWithGoogle, error, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email) {
      errors.email = 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Adresse email invalide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await signup(formData.email, formData.password, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`
      });
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Signup error:', error);
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
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Créer un compte
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="firstName"
              label="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              autoComplete="given-name"
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="lastName"
              label="Nom"
              value={formData.lastName}
              onChange={handleChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              margin="normal"
              autoComplete="family-name"
            />
          </Grid>
        </Grid>

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
          autoComplete="new-password"
        />

        <TextField
          fullWidth
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoComplete="new-password"
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
            'Créer le compte'
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
        <Typography variant="body2" color="text.secondary">
          Déjà un compte ?{' '}
          <Link component="button" onClick={onSwitchToLogin}>
            Se connecter
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default SignupForm;
