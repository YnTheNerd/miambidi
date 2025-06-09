import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Autocomplete,
  Grid
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

const DIETARY_RESTRICTIONS = [
  'végétarien', 'végan', 'sans gluten', 'sans produits laitiers', 'sans noix',
  'faible en glucides', 'faible en protides', 'halal', 'casher', 'sans porc',
  'sans alcool', 'faible en sel', 'sans piment'
];

const COMMON_ALLERGIES = [
  'pistaches', 'noix', 'arachides', 'fruits de mer', 'poisson', 'œufs',
  'produits laitiers', 'soja', 'blé', 'sésame', 'sulfites', 'gombo',
  'tomate', 'huile de palme'
];

const CUISINE_CATEGORIES = [
  'camerounaise', 'africaine', 'plats de riz', 'sauces traditionnelles',
  'grillades & braisés', 'street food', 'soupes & bouillons', 'libanaise',
  'plats de tubercules', 'desserts locaux'
];

function AddMemberDialog({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    age: '',
    dietaryRestrictions: [],
    allergies: [],
    favoriteCategories: [],
    dislikedFoods: []
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleArrayChange = (field) => (_, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 120)) {
      newErrors.age = 'Veuillez entrer un âge valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const memberData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };
      onAdd(memberData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      displayName: '',
      email: '',
      age: '',
      dietaryRestrictions: [],
      allergies: [],
      favoriteCategories: [],
      dislikedFoods: []
    });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonAdd sx={{ mr: 1 }} />
          Ajouter un Membre de la Famille
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations de Base
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom Complet"
                value={formData.displayName}
                onChange={handleChange('displayName')}
                error={!!errors.displayName}
                helperText={errors.displayName}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adresse Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Âge (optionnel)"
                type="number"
                value={formData.age}
                onChange={handleChange('age')}
                error={!!errors.age}
                helperText={errors.age}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>

            {/* Dietary Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Préférences et Restrictions Alimentaires
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                freeSolo
                options={DIETARY_RESTRICTIONS}
                value={formData.dietaryRestrictions}
                onChange={handleArrayChange('dietaryRestrictions')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Restrictions Alimentaires"
                    placeholder="Sélectionnez ou tapez des restrictions personnalisées..."
                    helperText="Tapez et appuyez sur Entrée pour ajouter des restrictions personnalisées"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                freeSolo
                options={COMMON_ALLERGIES}
                value={formData.allergies}
                onChange={handleArrayChange('allergies')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="warning"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Allergies"
                    placeholder="Sélectionnez ou tapez des allergies personnalisées..."
                    helperText="Tapez et appuyez sur Entrée pour ajouter des allergies personnalisées"
                  />
                )}
              />
            </Grid>

            {/* Food Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Préférences Culinaires
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                freeSolo
                options={CUISINE_CATEGORIES}
                value={formData.favoriteCategories}
                onChange={handleArrayChange('favoriteCategories')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="success"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cuisines Favorites"
                    placeholder="Sélectionnez ou tapez des cuisines favorites..."
                    helperText="Tapez et appuyez sur Entrée pour ajouter des cuisines personnalisées"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.dislikedFoods}
                onChange={handleArrayChange('dislikedFoods')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="error"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Aliments non appréciés"
                    placeholder="Tapez et appuyez sur Entrée..."
                    helperText="Tapez des aliments spécifiques à éviter"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<PersonAdd />}
        >
          Ajouter le Membre
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMemberDialog;
