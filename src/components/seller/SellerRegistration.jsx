/**
 * Seller Registration Component
 * Multi-step registration form for new sellers
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  PhotoCamera,
  Store,
  LocationOn,
  Schedule,
  LocalShipping,
  Phone,
  Email,
  Business
} from '@mui/icons-material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useSeller } from '../../contexts/SellerContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { SELLER_THEME, DEFAULT_SELLER_PROFILE } from '../../types/seller';
import SmartMapWrapper from '../maps/SmartMapWrapper';

const steps = [
  'Informations de base',
  'Localisation',
  'Horaires & Livraison',
  'Confirmation'
];

function SellerRegistration({ open, onClose, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...DEFAULT_SELLER_PROFILE,
    businessInfo: {
      ...DEFAULT_SELLER_PROFILE.businessInfo,
      phoneNumber: '',
      whatsappNumber: ''
    }
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const { createSellerProfile } = useSeller();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.shopName.trim()) {
          newErrors.shopName = 'Le nom de la boutique est requis';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'La description est requise';
        }
        if (!formData.businessInfo.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Le numéro de téléphone est requis';
        }
        break;

      case 1: // Location
        if (!formData.location.address.trim()) {
          newErrors.address = 'L\'adresse est requise';
        }
        if (!formData.location.city.trim()) {
          newErrors.city = 'La ville est requise';
        }
        if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
          newErrors.coordinates = 'Veuillez sélectionner votre position sur la carte';
        }
        break;

      case 2: // Hours & Delivery
        // Validation for operating hours if needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      // Here you would upload the logo file and get the URL
      let logoUrl = null;
      if (logoFile) {
        // Implement file upload logic here
        // logoUrl = await uploadFile(logoFile);
      }

      const sellerData = {
        ...formData,
        logoUrl
      };

      await createSellerProfile(sellerData);
      showNotification('Compte vendeur créé avec succès!', 'success');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating seller profile:', error);
      showNotification('Erreur lors de la création du compte vendeur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (location) => {
    handleNestedInputChange('location', 'coordinates', {
      lat: location.lat,
      lng: location.lng
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  src={logoPreview}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: SELLER_THEME.primary
                  }}
                >
                  <Store sx={{ fontSize: 48 }} />
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
                <Typography variant="caption" display="block">
                  Logo de la boutique (optionnel)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de la boutique *"
                value={formData.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                error={!!errors.shopName}
                helperText={errors.shopName}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description de votre activité *"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Numéro de téléphone *"
                value={formData.businessInfo.phoneNumber}
                onChange={(e) => handleNestedInputChange('businessInfo', 'phoneNumber', e.target.value)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="WhatsApp (optionnel)"
                value={formData.businessInfo.whatsappNumber}
                onChange={(e) => handleNestedInputChange('businessInfo', 'whatsappNumber', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Adresse complète *"
                value={formData.location.address}
                onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Ville *"
                value={formData.location.city}
                onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Rayon de livraison (km)"
                value={formData.location.deliveryRadius}
                onChange={(e) => handleNestedInputChange('location', 'deliveryRadius', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 50 }}
              />
              
              {errors.coordinates && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.coordinates}
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Sélectionnez votre position sur la carte
              </Typography>
              <SmartMapWrapper
                height={300}
                userLocation={formData.location.coordinates.lat ? formData.location.coordinates : null}
                showSearch={true}
                onMapClick={handleMapClick}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Paramètres de livraison
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.acceptsDelivery}
                    onChange={(e) => handleNestedInputChange('settings', 'acceptsDelivery', e.target.checked)}
                  />
                }
                label="Proposer la livraison"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.acceptsPickup}
                    onChange={(e) => handleNestedInputChange('settings', 'acceptsPickup', e.target.checked)}
                  />
                }
                label="Proposer le retrait en boutique"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Frais de livraison (FCFA)"
                value={formData.settings.deliveryFee}
                onChange={(e) => handleNestedInputChange('settings', 'deliveryFee', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Commande minimum (FCFA)"
                value={formData.settings.minimumOrderValue}
                onChange={(e) => handleNestedInputChange('settings', 'minimumOrderValue', parseInt(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Horaires d'ouverture
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.acceptsRequests}
                    onChange={(e) => handleNestedInputChange('settings', 'acceptsRequests', e.target.checked)}
                  />
                }
                label="Accepter les demandes de courses"
                sx={{ mb: 2 }}
              />
              
              <Alert severity="info">
                Les horaires détaillés peuvent être configurés plus tard dans votre tableau de bord.
              </Alert>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Récapitulatif de votre inscription
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nom de la boutique
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.shopName}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Téléphone
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.businessInfo.phoneNumber}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Adresse
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.location.address}, {formData.location.city}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Services
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {formData.settings.acceptsDelivery && (
                        <Chip label="Livraison" color="primary" size="small" />
                      )}
                      {formData.settings.acceptsPickup && (
                        <Chip label="Retrait" color="secondary" size="small" />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Alert severity="info">
              En créant votre compte vendeur, vous acceptez les conditions d'utilisation de MiamBidi Marketplace.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Card sx={{ 
          width: '100%', 
          maxWidth: 800, 
          maxHeight: '90vh', 
          overflow: 'auto' 
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: SELLER_THEME.primary }}>
              Devenir vendeur MiamBidi
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={onClose}>
                Annuler
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack}>
                    Précédent
                  </Button>
                )}
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ 
                      bgcolor: SELLER_THEME.primary,
                      '&:hover': { bgcolor: SELLER_THEME.secondary }
                    }}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ 
                      bgcolor: SELLER_THEME.primary,
                      '&:hover': { bgcolor: SELLER_THEME.secondary }
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Créer mon compte'}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}

export default SellerRegistration;
