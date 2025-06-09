/**
 * EditIngredientDialog Component for MiamBidi
 * Edit existing ingredients with validation and permission checks
 */

import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Restaurant,
  AttachMoney,
  Category,
  Description,
  Scale,
  Public,
  Lock,
  Edit
} from '@mui/icons-material';
import { useIngredients } from '../../contexts/IngredientContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { 
  INGREDIENT_CATEGORIES, 
  INGREDIENT_UNITS,
  SEASONALITY_MONTHS
} from '../../types/ingredient';

function EditIngredientDialog({ open, ingredient, onClose }) {
  const { updateIngredient } = useIngredients();
  const { family } = useFamily();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Autres',
    unit: 'pièce',
    isPublic: false,
    aliases: [],
    seasonality: [],
    preferredBrands: [],
    tags: [],
    notes: '',
    storageInstructions: '',
    averageShelfLife: null,
    averageWeight: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when ingredient changes
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        description: ingredient.description || '',
        price: ingredient.price || 0,
        category: ingredient.category || 'Autres',
        unit: ingredient.unit || 'pièce',
        isPublic: ingredient.isPublic || false,
        aliases: ingredient.aliases || [],
        seasonality: ingredient.seasonality || [],
        preferredBrands: ingredient.preferredBrands || [],
        tags: ingredient.tags || [],
        notes: ingredient.notes || '',
        storageInstructions: ingredient.storageInstructions || '',
        averageShelfLife: ingredient.averageShelfLife || null,
        averageWeight: ingredient.averageWeight || null
      });
      setErrors({});
    }
  }, [ingredient]);

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

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'ingrédient est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Price validation
    if (formData.price < 0) {
      newErrors.price = 'Le prix ne peut pas être négatif';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    // Unit validation
    if (!formData.unit) {
      newErrors.unit = 'Veuillez sélectionner une unité';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateIngredient(ingredient.id, formData);
      handleClose();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setLoading(false);
    onClose();
  };

  // Check if user can edit this ingredient
  const canEdit = ingredient && (
    ingredient.familyId === family?.id || 
    (!ingredient.isPublic && ingredient.familyId === family?.id)
  );

  if (!ingredient) return null;

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
          <Edit color="primary" />
          <Typography variant="h6">
            Modifier l'Ingrédient
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!canEdit && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Vous ne pouvez pas modifier cet ingrédient car il appartient à une autre famille ou est public.
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Informations de base
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom de l'ingrédient"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
              disabled={!canEdit}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Restaurant />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

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
              disabled={!canEdit}
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
            <FormControl fullWidth error={!!errors.category} required disabled={!canEdit}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={formData.category}
                label="Catégorie"
                onChange={handleChange('category')}
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

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.unit} required disabled={!canEdit}>
              <InputLabel>Unité par défaut</InputLabel>
              <Select
                value={formData.unit}
                label="Unité par défaut"
                onChange={handleChange('unit')}
              >
                {INGREDIENT_UNITS.map((unit) => (
                  <MenuItem key={unit.name} value={unit.name}>
                    {unit.name}
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (optionnelle)"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              disabled={!canEdit}
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

          {/* Advanced Fields */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Informations avancées
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              disabled={!canEdit}
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
              rows={2}
              disabled={!canEdit}
              placeholder="Conseils d'achat, marques préférées, etc."
            />
          </Grid>

          {/* Visibility Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Paramètres de visibilité
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={handleSwitchChange('isPublic')}
                  color="primary"
                  disabled={!canEdit}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {formData.isPublic ? <Public /> : <Lock />}
                  <Box>
                    <Typography variant="body1">
                      {formData.isPublic ? 'Ingrédient public' : 'Ingrédient privé'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.isPublic 
                        ? 'Visible par toutes les familles'
                        : 'Visible uniquement par votre famille'
                      }
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          {canEdit ? 'Annuler' : 'Fermer'}
        </Button>
        {canEdit && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Edit />}
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EditIngredientDialog;
