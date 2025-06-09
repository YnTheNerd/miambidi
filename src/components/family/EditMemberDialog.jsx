import { useState, useEffect } from 'react';
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
import { Edit } from '@mui/icons-material';

const DIETARY_RESTRICTIONS = [
  'végétarien',
  'végan',
  'sans gluten',
  'sans produits laitiers',
  'sans noix',
  'faible en glucides',
  'faible en protides',
  'halal',
  'casher',
  'sans porc',
  'sans alcool',
  'faible en sel',
  'sans piment'
];

const COMMON_ALLERGIES = [
  'pistaches',
  'noix',
  'arachides',
  'fruits de mer',
  'poisson',
  'œufs',
  'produits laitiers',
  'soja',
  'blé',
  'sésame',
  'sulfites',
  'gombo',
  'tomate',
  'huile de palme'
];

const CUISINE_CATEGORIES = [
  'camerounaise', // La catégorie principale
  'africaine', // Pour englober les cuisines des pays voisins et de l'Afrique de l'Ouest/Centrale
  'plats de riz', // Riz sauté, riz gras, riz aux sauces
  'sauces traditionnelles', //  la sauce arachide, sauce gombo, mbongo
  'grillades & braisés', // Poisson braisé, poulet braisé, soya
  'street food', // Beignets, soya, sandwichs, œufs à la coque, bouillie
  'soupes & bouillons',

  'libanaise', // Très populaire dans les grandes villes
  'plats de tubercules', // Spécifique : Ndolè, Eru, Achu, Okok, Kondrè etc.

  'desserts locaux' // Gâteaux, fruits, etc.
];

function EditMemberDialog({ open, member, onClose, onSave }) {
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

  // Initialiser les données du formulaire lorsque le membre change
  useEffect(() => {
    if (member) {
      setFormData({
        displayName: member.displayName || '',
        email: member.email || '',
        age: member.age ? member.age.toString() : '',
        dietaryRestrictions: member.preferences?.dietaryRestrictions || [],
        allergies: member.preferences?.allergies || [],
        favoriteCategories: member.preferences?.favoriteCategories || [],
        dislikedFoods: member.preferences?.dislikedFoods || []
      });
    }
  }, [member]);

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
      const updatedData = {
        displayName: formData.displayName,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : null,
        preferences: {
          dietaryRestrictions: formData.dietaryRestrictions,
          allergies: formData.allergies,
          favoriteCategories: formData.favoriteCategories,
          dislikedFoods: formData.dislikedFoods
        }
      };
      onSave(updatedData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Edit sx={{ mr: 1 }} />
          Modifier {member.displayName}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations basiques
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom complet"
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
                label="Adresse email"
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
                label="Age (optionnel)"
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
                Préférences alimentaires & restrictions
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
                    label="Restrictions Dietetiques"
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
                    label="Allergies alimentaires"
                    placeholder="Sélectionnez ou tapez des allergies alimentaires..."
                    helperText="Tapez et appuyez sur Entrée pour ajouter des allergies alimentaires"
                  />
                )}
              />
            </Grid>

            {/* Food Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Préférences alimentaires
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
                    label="Cuisines favorites"
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
          startIcon={<Edit />}
        >
          Enregistrer les modifications
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditMemberDialog;
