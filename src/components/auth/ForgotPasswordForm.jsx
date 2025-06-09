/**
 * Forgot Password Form Component for MiamBidi
 * Handles password reset email sending
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Email,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function ForgotPasswordForm({ onBackToLogin }) {
  const { resetPassword, error, setError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear errors when user starts typing
    if (emailError) setEmailError('');
    if (error) setError(null);
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError('L\'adresse email est requise');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Adresse email invalide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
           𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢 
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Email envoyé
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
          Vérifiez votre boîte de réception et suivez les instructions.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou réessayez avec une autre adresse.
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBackToLogin}
          sx={{ mb: 2 }}
        >
          Retour à la connexion
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => {
            setIsSuccess(false);
            setEmail('');
          }}
        >
          Essayer une autre adresse
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Mot de passe oublié
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </Typography>

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
          value={email}
          onChange={handleChange}
          error={!!emailError}
          helperText={emailError}
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 3, mb: 2 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Envoyer le lien de réinitialisation'
          )}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={onBackToLogin}
          startIcon={<ArrowBack />}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          Retour à la connexion
        </Link>
      </Box>
    </Paper>
  );
}

export default ForgotPasswordForm;
