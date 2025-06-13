import React, { useState } from 'react';
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
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Save,
  Restaurant,
  AutoAwesome
} from '@mui/icons-material';
import ImageUpload from './ImageUpload';
import RecipeVisibilitySelector from './RecipeVisibilitySelector';
import EnhancedIngredientInput from './EnhancedIngredientInput';
import EditableInstructionList from './EditableInstructionList';
import { useRecipes } from '../../contexts/RecipeContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useIngredients } from '../../contexts/IngredientContext';
import { generateRecipeWithDeepSeek, getApiKeyStatus } from '../../services/deepseekService';

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

function AddRecipeDialog({ open, onClose, onSave }) {
  const { generateRecipeFromMealName, VISIBILITY_TYPES } = useRecipes();
  const { currentFamily } = useFamily();
  const { ingredients: availableIngredients } = useIngredients();
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
    visibility: currentFamily ? 'family' : 'private', // Default based on family availability
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: ''
  });
  const [newInstruction, setNewInstruction] = useState('');
  const [newTip, setNewTip] = useState('');

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
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
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
    // Handle both direct ingredient object (from EnhancedIngredientInput) and legacy format
    let ingredientToAdd;

    if (ingredient && typeof ingredient === 'object') {
      // New format from EnhancedIngredientInput
      ingredientToAdd = {
        name: ingredient.name.trim(),
        quantity: parseFloat(ingredient.quantity),
        unit: ingredient.unit.trim(),
        category: ingredient.category || 'Autres'
      };
    } else {
      // Legacy format (fallback)
      if (newIngredient.name.trim() && newIngredient.quantity && newIngredient.unit.trim()) {
        ingredientToAdd = {
          name: newIngredient.name.trim(),
          quantity: parseFloat(newIngredient.quantity),
          unit: newIngredient.unit.trim(),
          category: newIngredient.category || 'Autres'
        };
      } else {
        return; // Invalid ingredient data
      }
    }

    console.log('Adding ingredient to recipe:', ingredientToAdd); // Debug log

    setFormData(prevFormData => ({
      ...prevFormData,
      ingredients: [...prevFormData.ingredients, ingredientToAdd]
    }));

    // Reset legacy form if used
    if (!ingredient) {
      setNewIngredient({ name: '', quantity: '', unit: '', category: '' });
    }

    // Clear ingredients error if it exists
    if (errors.ingredients) {
      setErrors(prevErrors => ({
        ...prevErrors,
        ingredients: ''
      }));
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

  const handleGenerateWithAI = async () => {
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      return;
    }

    // Check API key status
    const apiStatus = getApiKeyStatus();
    if (!apiStatus.configured) {
      setSuccessMessage(
        apiStatus.placeholder
          ? 'Clé API DeepSeek non configurée. Veuillez configurer votre clé API dans src/services/deepseekService.js'
          : 'Clé API DeepSeek invalide. Vérifiez votre configuration.'
      );
      setShowSuccessSnackbar(true);
      return;
    }

    setIsGenerating(true);
    setSuccessMessage('');
    setGenerationProgress('Connexion à l\'IA DeepSeek...');

    try {
      // Add progress updates
      setTimeout(() => setGenerationProgress('Analyse du nom de la recette...'), 1000);
      setTimeout(() => setGenerationProgress('Génération des ingrédients...'), 2000);
      setTimeout(() => setGenerationProgress('Création des instructions...'), 3000);
      setTimeout(() => setGenerationProgress('Finalisation de la recette...'), 4000);

      // Build enhanced context for AI generation
      const enhancedContext = {
        dietaryPreferences: formData.categories,
        cookingEquipment: ['casserole', 'poêle', 'four'], // Default equipment
        skillLevel: formData.difficulty,
        servings: parseInt(formData.servings) || 4,
        maxPrepTime: formData.prepTime ? parseInt(formData.prepTime) + parseInt(formData.cookTime || 0) : null,
        cuisineStyle: formData.cuisine,
        cookingMethod: null, // Could be extracted from recipe name
        familySize: currentFamily?.memberCount || null,
        allergies: formData.dietaryInfo.allergens
      };

      // Use DeepSeek API for recipe generation with enhanced context
      const generatedRecipe = await generateRecipeWithDeepSeek(
        formData.name.trim(),
        availableIngredients || [],
        enhancedContext
      );

      // Only populate empty fields - don't overwrite user input
      const updatedFormData = { ...formData };

      if (!formData.description.trim()) {
        updatedFormData.description = generatedRecipe.description;
      }

      if (!formData.prepTime) {
        updatedFormData.prepTime = generatedRecipe.prepTime.toString();
      }

      if (!formData.cookTime) {
        updatedFormData.cookTime = generatedRecipe.cookTime.toString();
      }

      if (!formData.servings) {
        updatedFormData.servings = generatedRecipe.servings.toString();
      }

      if (formData.difficulty === 'Moyen') { // Only change if still default
        updatedFormData.difficulty = generatedRecipe.difficulty;
      }

      if (formData.cuisine === 'camerounaise') { // Only change if still default
        updatedFormData.cuisine = generatedRecipe.cuisine;
      }

      if (formData.categories.length === 0) {
        updatedFormData.categories = generatedRecipe.categories || [];
      }

      if (formData.ingredients.length === 0) {
        updatedFormData.ingredients = generatedRecipe.ingredients;
      }

      if (formData.instructions.length === 0) {
        updatedFormData.instructions = generatedRecipe.instructions;
      }

      if (formData.tips.length === 0) {
        updatedFormData.tips = generatedRecipe.tips || [];
      }

      if (!formData.nutrition.calories) {
        updatedFormData.nutrition = {
          calories: generatedRecipe.nutrition?.calories?.toString() || '',
          protein: generatedRecipe.nutrition?.protein?.toString() || '',
          carbs: generatedRecipe.nutrition?.carbs?.toString() || '',
          fat: generatedRecipe.nutrition?.fat?.toString() || '',
          fiber: generatedRecipe.nutrition?.fiber?.toString() || ''
        };
      }

      setFormData(updatedFormData);

      // Show success message
      setSuccessMessage('Recette générée avec succès par l\'IA DeepSeek !');
      setShowSuccessSnackbar(true);

    } catch (error) {
      console.error('Error generating recipe with DeepSeek:', error);

      // Provide user-friendly error messages with more context
      let errorMessage = 'Erreur lors de la génération. Veuillez réessayer.';

      if (error.message.includes('Clé API')) {
        errorMessage = error.message;
      } else if (error.message.includes('connexion')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
      } else if (error.message.includes('limite') || error.message.includes('429')) {
        errorMessage = 'Limite API atteinte. Veuillez patienter quelques minutes avant de réessayer.';
      } else if (error.message.includes('JSON') || error.message.includes('format')) {
        errorMessage = 'Erreur de format dans la réponse de l\'IA. Le système va automatiquement réessayer avec des paramètres optimisés.';
      } else if (error.message.includes('tentatives')) {
        errorMessage = 'Plusieurs tentatives ont échoué. Essayez avec un nom de recette plus simple ou vérifiez votre connexion.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Problème d\'authentification API. Contactez l\'administrateur.';
      }

      setSuccessMessage(errorMessage);
      setShowSuccessSnackbar(true);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
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
      const newRecipe = {
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
        }
      };
      onSave(newRecipe);
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      difficulty: 'Moyen',
      cuisine: 'camerounaise',
      categories: [],
      visibility: currentFamily ? 'family' : 'private', // Default based on family availability
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
    setErrors({});
    setIsGenerating(false);
    setGenerationProgress('');
    setSuccessMessage('');
    setShowSuccessSnackbar(false);
    setNewIngredient({ name: '', quantity: '', unit: '', category: '' });
    setNewInstruction('');
    setNewTip('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Restaurant color="primary" />
            <Typography variant="h5">
              Ajouter une Nouvelle Recette
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
            <Grid item xs={12} md={10}>
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

            <Grid item xs={12} md={2}>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={isGenerating ? <CircularProgress size={16} /> : <AutoAwesome />}
                  onClick={handleGenerateWithAI}
                  disabled={!formData.name.trim() || formData.name.trim().length < 3 || isGenerating}
                  fullWidth
                  sx={{
                    height: '56px',
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e1bee7 90%)',
                    color: 'white',
                    border: 'none',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7b1fa2 30%, #ce93d8 90%)',
                      border: 'none'
                    },
                    '&:disabled': {
                      background: 'rgba(156, 39, 176, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  {isGenerating ? 'IA en cours...' : 'Générer avec IA'}
                </Button>
                {isGenerating && generationProgress && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 0.5,
                      textAlign: 'center',
                      color: 'primary.main',
                      fontSize: '0.7rem'
                    }}
                  >
                    {generationProgress}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={12}>
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

          {/* Recipe Visibility */}
          <Typography variant="h6" gutterBottom>
            Partage et Visibilité
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <RecipeVisibilitySelector
                value={formData.visibility}
                onChange={(newVisibility) => setFormData({...formData, visibility: newVisibility})}
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
          {console.log('Current ingredients in formData:', formData.ingredients) /* Debug log */}
          {formData.ingredients && formData.ingredients.length > 0 ? (
            <List sx={{ mb: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 0, fontWeight: 'bold' }}>
                Ingrédients ajoutés ({formData.ingredients.length})
              </Typography>
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
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              Aucun ingrédient ajouté. Utilisez le formulaire ci-dessus pour ajouter des ingrédients.
            </Alert>
          )}

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
                placeholder="Ajoutez un conseil utile pour cette recette..."
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
          Créer la Recette
        </Button>
      </DialogActions>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity={successMessage.includes('Erreur') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default AddRecipeDialog;
