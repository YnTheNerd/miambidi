/**
 * Enhanced AddIngredientDialog Component for MiamBidi
 * Comprehensive ingredient creation with advanced features
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  Restaurant,
  AttachMoney,
  Category,
  Description,
  Scale,
  Public,
  Lock,
  LocalOffer,
  Schedule,
  Inventory,
  Add
} from '@mui/icons-material';
import { useIngredients } from '../../contexts/IngredientContext';
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  STORAGE_LOCATIONS,
  SEASONALITY_MONTHS,
  DEFAULT_INGREDIENT
} from '../../types/ingredient';

const STEPS = [
  'Informations de base',
  'Prix et unité',
  'Détails avancés',
  'Paramètres'
];

function AddIngredientDialog({ open, onClose }) {
  const { addIngredient } = useIngredients();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    ...DEFAULT_INGREDIENT
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    const value = field === 'price' || field === 'averageShelfLife' || field === 'averageWeight'
      ? parseFloat(event.target.value) || 0
      : event.target.value;

    setFormData({
      ...formData,
      [field]: value
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    });
  };

  const handleArrayChange = (field) => (event, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) {
          newErrors.name = 'Le nom de l\'ingrédient est requis';
        } else if (formData.name.trim().length < 2) {
          newErrors.name = 'Le nom doit contenir au moins 2 caractères';
        }

        if (!formData.category) {
          newErrors.category = 'Veuillez sélectionner une catégorie';
        }
        break;

      case 1: // Price and Unit
        if (formData.price < 0) {
          newErrors.price = 'Le prix ne peut pas être négatif';
        }

        if (!formData.unit) {
          newErrors.unit = 'Veuillez sélectionner une unité';
        }
        break;

      case 2: // Advanced Details
        if (formData.averageShelfLife && formData.averageShelfLife < 0) {
          newErrors.averageShelfLife = 'La durée de conservation ne peut pas être négative';
        }

        if (formData.averageWeight && formData.averageWeight < 0) {
          newErrors.averageWeight = 'Le poids moyen ne peut pas être négatif';
        }
        break;

      case 3: // Settings
        // No specific validation for settings step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    try {
      await addIngredient(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ ...DEFAULT_INGREDIENT });
    setErrors({});
    setLoading(false);
    setActiveStep(0);
    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'ingrédient"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Restaurant />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={formData.category}
                  label="Catégorie"
                  onChange={handleChange('category')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Category />
                    </InputAdornment>
                  }
                >
                  {INGREDIENT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optionnelle)"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                placeholder="Ajoutez une description pour cet ingrédient..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.aliases}
                onChange={handleArrayChange('aliases')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Noms alternatifs"
                    placeholder="Ajoutez des noms alternatifs..."
                    helperText="Appuyez sur Entrée pour ajouter un nom alternatif"
                  />
                )}
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
                label="Prix (FCFA)"
                type="number"
                value={formData.price}
                onChange={handleChange('price')}
                error={!!errors.price}
                helperText={errors.price}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.unit} required>
                <InputLabel>Unité par défaut</InputLabel>
                <Select
                  value={formData.unit}
                  label="Unité par défaut"
                  onChange={handleChange('unit')}
                  startAdornment={
                    <InputAdornment position="start">
                      <Scale />
                    </InputAdornment>
                  }
                >
                  {INGREDIENT_UNITS.map((unit) => (
                    <MenuItem key={unit.name} value={unit.name}>
                      {unit.name} ({unit.type})
                    </MenuItem>
                  ))}
                </Select>
                {errors.unit && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.unit}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Poids/Volume moyen par unité"
                type="number"
                value={formData.averageWeight}
                onChange={handleChange('averageWeight')}
                error={!!errors.averageWeight}
                helperText={errors.averageWeight || "Pour les conversions d'unités"}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Scale />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Durée de conservation (jours)"
                type="number"
                value={formData.averageShelfLife}
                onChange={handleChange('averageShelfLife')}
                error={!!errors.averageShelfLife}
                helperText={errors.averageShelfLife || "Durée moyenne de conservation"}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions de conservation"
                value={formData.storageInstructions}
                onChange={handleChange('storageInstructions')}
                multiline
                rows={2}
                placeholder="Ex: Conserver au réfrigérateur, à l'abri de la lumière..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={SEASONALITY_MONTHS}
                value={formData.seasonality}
                onChange={handleArrayChange('seasonality')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Saisonnalité"
                    placeholder="Sélectionnez les mois de disponibilité..."
                    helperText="Mois où l'ingrédient est généralement disponible"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.preferredBrands}
                onChange={handleArrayChange('preferredBrands')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Marques préférées"
                    placeholder="Ajoutez des marques recommandées..."
                    helperText="Appuyez sur Entrée pour ajouter une marque"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.tags}
                onChange={handleArrayChange('tags')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Étiquettes"
                    placeholder="Ajoutez des étiquettes pour l'organisation..."
                    helperText="Ex: bio, local, épicé, etc."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={3}
                placeholder="Conseils d'achat, préparation, utilisation..."
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Paramètres de visibilité
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Par défaut, les ingrédients sont publics</strong> pour une meilleure compatibilité
                    avec la base de données existante et une visibilité maximale.
                  </Typography>
                </Alert>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublic}
                      onChange={handleSwitchChange('isPublic')}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      {formData.isPublic ? <Public color="success" /> : <Lock color="warning" />}
                      <Box>
                        <Typography variant="body1">
                          {formData.isPublic ? 'Ingrédient public (recommandé)' : 'Ingrédient privé'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formData.isPublic
                            ? 'Visible par toutes les familles - Compatible avec les ingrédients existants'
                            : 'Visible uniquement par votre famille - Utilisation limitée'
                          }
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Récapitulatif:</strong><br />
                  • Nom: {formData.name || 'Non défini'}<br />
                  • Catégorie: {formData.category || 'Non définie'}<br />
                  • Prix: {formData.price} FCFA par {formData.unit}<br />
                  • Visibilité: {formData.isPublic ? 'Public' : 'Famille uniquement'}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return 'Étape inconnue';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Restaurant color="primary" />
          <Typography variant="h6">
            Ajouter un Nouvel Ingrédient
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {STEPS.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {getStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === STEPS.length - 1 ? handleSubmit : handleNext}
                    disabled={loading}
                    startIcon={loading && index === STEPS.length - 1 ? <CircularProgress size={20} /> : null}
                  >
                    {index === STEPS.length - 1 ?
                      (loading ? 'Ajout en cours...' : 'Ajouter l\'ingrédient') :
                      'Suivant'
                    }
                  </Button>
                  <Button
                    disabled={index === 0 || loading}
                    onClick={handleBack}
                    sx={{ ml: 1 }}
                  >
                    Précédent
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddIngredientDialog;
