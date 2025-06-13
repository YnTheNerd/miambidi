import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Edit,
  Save
} from '@mui/icons-material';
import ImageUpload from './ImageUpload';
import EnhancedIngredientInput from './EnhancedIngredientInput';
import EditableInstructionList from './EditableInstructionList';

// Import existing categories and dietary restrictions
const CUISINE_CATEGORIES = [
  'camerounaise',
  'africaine',
  'plats de riz',
  'sauces traditionnelles',
  'grillades & braisés',
  'street food',
  'soupes & bouillons',
  'libanaise',
  'plats de tubercules',
  'desserts locaux'
];

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

const COMMON_ALLERGENS = [
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

const SHOPPING_CATEGORIES = [
  'Tubercules & Plantains',
  'Viandes & Poissons',
  'Légumes-feuilles & Aromates',
  'Céréales & Légumineuses',
  'Huiles & Condiments',
  'Épices & Piments',
  'Produits Laitiers & Œufs',
  'Boissons',
  'Collations',
  'Autres'
];

const DIFFICULTY_LEVELS = ['Facile', 'Moyen', 'Difficile'];
const CUISINE_TYPES = ['camerounaise', 'africaine', 'libanaise'];

function EditRecipeDialog({ open, recipe, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Moyen',
    cuisine: 'camerounaise',
    categories: [],
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      containsNuts: false,
      allergens: []
    },
    ingredients: [],
    instructions: [],
    tips: [],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [newInstruction, setNewInstruction] = useState('');
  const [newTip, setNewTip] = useState('');

  // Initialize form data when recipe changes
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        imageUrl: recipe.imageUrl || recipe.image || '',
        prepTime: recipe.prepTime?.toString() || '',
        cookTime: recipe.cookTime?.toString() || '',
        servings: recipe.servings?.toString() || '',
        difficulty: recipe.difficulty || 'Moyen',
        cuisine: recipe.cuisine || 'camerounaise',
        categories: recipe.categories || [],
        dietaryInfo: {
          isVegetarian: recipe.dietaryInfo?.isVegetarian || false,
          isVegan: recipe.dietaryInfo?.isVegan || false,
          isGlutenFree: recipe.dietaryInfo?.isGlutenFree || false,
          isDairyFree: recipe.dietaryInfo?.isDairyFree || false,
          containsNuts: recipe.dietaryInfo?.containsNuts || false,
          allergens: recipe.dietaryInfo?.allergens || []
        },
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        tips: recipe.tips || [],
        nutrition: {
          calories: recipe.nutrition?.calories?.toString() || '',
          protein: recipe.nutrition?.protein?.toString() || '',
          carbs: recipe.nutrition?.carbs?.toString() || '',
          fat: recipe.nutrition?.fat?.toString() || '',
          fiber: recipe.nutrition?.fiber?.toString() || ''
        }
      });
      setErrors({});
    }
  }, [recipe]);

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

  const handleDietaryChange = (field) => (event) => {
    setFormData({
      ...formData,
      dietaryInfo: {
        ...formData.dietaryInfo,
        [field]: event.target.checked
      }
    });
  };

  const handleNutritionChange = (field) => (event) => {
    setFormData({
      ...formData,
      nutrition: {
        ...formData.nutrition,
        [field]: event.target.value
      }
    });
  };

  const handleArrayChange = (field) => (_, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue
    });
  };

  const handleAllergenChange = (_, newValue) => {
    setFormData({
      ...formData,
      dietaryInfo: {
        ...formData.dietaryInfo,
        allergens: newValue
      }
    });
  };

  const addIngredient = (ingredient) => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredient]
    });

    // Clear ingredients error if it exists
    if (errors.ingredients) {
      setErrors({
        ...errors,
        ingredients: ''
      });
    }
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const addInstruction = () => {
    if (newInstruction.trim() && newInstruction.trim().length >= 10) {
      setFormData({
        ...formData,
        instructions: [...formData.instructions, newInstruction.trim()]
      });
      setNewInstruction('');

      // Clear instructions error if it exists
      if (errors.instructions) {
        setErrors({
          ...errors,
          instructions: ''
        });
      }
    }
  };

  const removeInstruction = (index) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData({
        ...formData,
        tips: [...formData.tips, newTip.trim()]
      });
      setNewTip('');
    }
  };

  const removeTip = (index) => {
    setFormData({
      ...formData,
      tips: formData.tips.filter((_, i) => i !== index)
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la recette est requis';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }

    // Time and Serving Validation
    if (!formData.prepTime || isNaN(formData.prepTime) || formData.prepTime <= 0) {
      newErrors.prepTime = 'Temps de préparation valide requis (minimum 1 minute)';
    } else if (formData.prepTime > 1440) { // 24 hours
      newErrors.prepTime = 'Temps de préparation trop long (maximum 24 heures)';
    }

    if (!formData.cookTime || isNaN(formData.cookTime) || formData.cookTime <= 0) {
      newErrors.cookTime = 'Temps de cuisson valide requis (minimum 1 minute)';
    } else if (formData.cookTime > 1440) { // 24 hours
      newErrors.cookTime = 'Temps de cuisson trop long (maximum 24 heures)';
    }

    if (!formData.servings || isNaN(formData.servings) || formData.servings <= 0) {
      newErrors.servings = 'Nombre de portions valide requis (minimum 1)';
    } else if (formData.servings > 50) {
      newErrors.servings = 'Nombre de portions trop élevé (maximum 50)';
    }

    // Ingredients Validation
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Au moins un ingrédient est requis';
    } else {
      // Validate each ingredient
      const invalidIngredients = formData.ingredients.filter(ing =>
        !ing.name.trim() || !ing.quantity || !ing.unit.trim()
      );
      if (invalidIngredients.length > 0) {
        newErrors.ingredients = 'Tous les ingrédients doivent avoir un nom, une quantité et une unité';
      }
    }

    // Instructions Validation
    if (formData.instructions.length === 0) {
      newErrors.instructions = 'Au moins une instruction est requise';
    } else {
      // Validate each instruction
      const invalidInstructions = formData.instructions.filter(inst =>
        !inst.trim() || inst.trim().length < 10
      );
      if (invalidInstructions.length > 0) {
        newErrors.instructions = 'Toutes les instructions doivent contenir au moins 10 caractères';
      }
    }

    // Categories Validation
    if (formData.categories.length === 0) {
      newErrors.categories = 'Au moins une catégorie est requise';
    }

    // Nutrition Validation (if provided)
    if (formData.nutrition.calories && (isNaN(formData.nutrition.calories) || formData.nutrition.calories < 0)) {
      newErrors.nutrition = 'Les valeurs nutritionnelles doivent être des nombres positifs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const updatedRecipe = {
        ...recipe,
        ...formData,
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        servings: parseInt(formData.servings),
        nutrition: {
          calories: parseInt(formData.nutrition.calories) || 0,
          protein: parseInt(formData.nutrition.protein) || 0,
          carbs: parseInt(formData.nutrition.carbs) || 0,
          fat: parseInt(formData.nutrition.fat) || 0,
          fiber: parseInt(formData.nutrition.fiber) || 0
        },
        updatedAt: new Date().toISOString()
      };
      onSave(updatedRecipe);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit color="primary" />
            <Typography variant="h5">
              Modifier la Recette
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Informations de Base
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Nom de la Recette"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" gutterBottom>
                Image de la Recette
              </Typography>
              <ImageUpload
                currentImage={formData.imageUrl}
                onImageSelect={(imagePath) => setFormData({...formData, imageUrl: imagePath})}
                recipeName={formData.name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Recipe Details */}
          <Typography variant="h6" gutterBottom>
            Détails de la Recette
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Temps de Préparation (min)"
                value={formData.prepTime}
                onChange={handleChange('prepTime')}
                error={!!errors.prepTime}
                helperText={errors.prepTime}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Temps de Cuisson (min)"
                value={formData.cookTime}
                onChange={handleChange('cookTime')}
                error={!!errors.cookTime}
                helperText={errors.cookTime}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Nombre de Portions"
                value={formData.servings}
                onChange={handleChange('servings')}
                error={!!errors.servings}
                helperText={errors.servings}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Difficulté</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={handleChange('difficulty')}
                  label="Difficulté"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de Cuisine</InputLabel>
                <Select
                  value={formData.cuisine}
                  onChange={handleChange('cuisine')}
                  label="Type de Cuisine"
                >
                  {CUISINE_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={CUISINE_CATEGORIES}
                value={formData.categories}
                onChange={handleArrayChange('categories')}
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
                    label="Catégories"
                    placeholder="Sélectionner des catégories..."
                    error={!!errors.categories}
                    helperText={errors.categories}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Dietary Information */}
          <Typography variant="h6" gutterBottom>
            Informations Diététiques
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dietaryInfo.isVegetarian}
                    onChange={handleDietaryChange('isVegetarian')}
                  />
                }
                label="Végétarien"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dietaryInfo.isVegan}
                    onChange={handleDietaryChange('isVegan')}
                  />
                }
                label="Végan"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dietaryInfo.isGlutenFree}
                    onChange={handleDietaryChange('isGlutenFree')}
                  />
                }
                label="Sans Gluten"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dietaryInfo.isDairyFree}
                    onChange={handleDietaryChange('isDairyFree')}
                  />
                }
                label="Sans Lait"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dietaryInfo.containsNuts}
                    onChange={handleDietaryChange('containsNuts')}
                  />
                }
                label="Contient des Noix"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={COMMON_ALLERGENS}
                value={formData.dietaryInfo.allergens}
                onChange={handleAllergenChange}
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
                    label="Allergènes"
                    placeholder="Sélectionner des allergènes..."
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Ingredients Section */}
          <Typography variant="h6" gutterBottom>
            Ingrédients
          </Typography>

          {errors.ingredients && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.ingredients}
            </Alert>
          )}

          {/* Enhanced Ingredient Input */}
          <EnhancedIngredientInput
            onAddIngredient={addIngredient}
            error={errors.ingredients}
          />

          {/* Ingredients List */}
          <List sx={{ mb: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            {formData.ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                  secondary={ingredient.category}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeIngredient(index)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Enhanced Instructions Section with Inline Editing */}
          <EditableInstructionList
            instructions={formData.instructions}
            onInstructionsChange={(newInstructions) => {
              setFormData({ ...formData, instructions: newInstructions });
              // Clear instructions error if it exists
              if (errors.instructions) {
                setErrors({ ...errors, instructions: '' });
              }
            }}
            newInstruction={newInstruction}
            onNewInstructionChange={setNewInstruction}
            onAddInstruction={addInstruction}
            error={errors.instructions}
            readOnly={false}
            showAddForm={true}
          />

          <Divider sx={{ my: 3 }} />

          {/* Tips Section */}
          <Typography variant="h6" gutterBottom>
            Conseils (Optionnel)
          </Typography>

          {/* Add New Tip */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={11}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Nouveau conseil"
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={addTip}
                sx={{ height: '80px' }}
              >
                <Add />
              </Button>
            </Grid>
          </Grid>

          {/* Tips List */}
          {formData.tips.length > 0 && (
            <List sx={{ mb: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
              {formData.tips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemText primary={tip} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeTip(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Nutrition Section */}
          <Typography variant="h6" gutterBottom>
            Informations Nutritionnelles (Optionnel)
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Calories"
                value={formData.nutrition.calories}
                onChange={handleNutritionChange('calories')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Protéines (g)"
                value={formData.nutrition.protein}
                onChange={handleNutritionChange('protein')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Glucides (g)"
                value={formData.nutrition.carbs}
                onChange={handleNutritionChange('carbs')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Lipides (g)"
                value={formData.nutrition.fat}
                onChange={handleNutritionChange('fat')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Fibres (g)"
                value={formData.nutrition.fiber}
                onChange={handleNutritionChange('fiber')}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
        >
          Enregistrer les Modifications
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditRecipeDialog;
