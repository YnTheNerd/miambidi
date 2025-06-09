import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Add, Warning, CheckCircle } from '@mui/icons-material';
import { useIngredients } from '../../contexts/IngredientContext';
import { UnitSuggestions } from '../common/UnitEquivalenceDisplay';

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

const COMMON_UNITS = ['g', 'kg', 'ml', 'L', 'pièces', 'cuillères à soupe', 'cuillères à café', 'tasses'];

function EnhancedIngredientInput({ onAddIngredient, error }) {
  const { ingredients, addIngredient, loading: ingredientsLoading } = useIngredients();
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: ''
  });
  
  // New ingredient creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    price: '',
    category: 'Autres',
    unit: ''
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
  const [createError, setCreateError] = useState('');

  // Autocomplete state
  const [inputValue, setInputValue] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // Check if ingredient exists
  const findExistingIngredient = (name) => {
    if (!name) return null;
    const normalizedName = name.toLowerCase().trim();
    return ingredients.find(ing => 
      ing.name.toLowerCase().trim() === normalizedName ||
      ing.searchTerms?.some(term => term.toLowerCase() === normalizedName)
    );
  };

  // Handle ingredient selection or creation
  const handleIngredientChange = (event, value, reason) => {
    if (reason === 'selectOption') {
      // User selected an existing ingredient
      setSelectedIngredient(value);
      setNewIngredient(prev => ({
        ...prev,
        name: value.name,
        category: value.category || 'Autres'
      }));
    } else if (reason === 'clear') {
      setSelectedIngredient(null);
      setNewIngredient(prev => ({ ...prev, name: '', category: '' }));
    }
  };

  // Handle input value change (for freeSolo)
  const handleInputChange = (event, value, reason) => {
    setInputValue(value);
    
    if (reason === 'input') {
      // User is typing
      const existing = findExistingIngredient(value);
      if (existing) {
        setSelectedIngredient(existing);
        setNewIngredient(prev => ({
          ...prev,
          name: existing.name,
          category: existing.category || 'Autres'
        }));
      } else {
        setSelectedIngredient(null);
        setNewIngredient(prev => ({
          ...prev,
          name: value,
          category: prev.category || 'Autres'
        }));
      }
    }
  };

  // Handle creating new ingredient
  const handleCreateNewIngredient = () => {
    if (!newIngredient.name.trim()) return;
    
    const existing = findExistingIngredient(newIngredient.name);
    if (existing) {
      // Ingredient exists, just use it
      setSelectedIngredient(existing);
      setNewIngredient(prev => ({
        ...prev,
        name: existing.name,
        category: existing.category || 'Autres'
      }));
      return;
    }

    // Show creation dialog for new ingredient
    setNewIngredientData({
      name: newIngredient.name.trim(),
      price: '',
      category: newIngredient.category || 'Autres',
      unit: newIngredient.unit || 'g'
    });
    setShowCreateDialog(true);
    setCreateError('');
  };

  // Confirm new ingredient creation
  const confirmCreateIngredient = async () => {
    if (!newIngredientData.name.trim() || !newIngredientData.price || newIngredientData.price <= 0) {
      setCreateError('Veuillez remplir tous les champs requis avec des valeurs valides.');
      return;
    }

    setIsCreatingIngredient(true);
    setCreateError('');

    try {
      const createdIngredient = await addIngredient({
        name: newIngredientData.name.trim(),
        price: parseFloat(newIngredientData.price),
        category: newIngredientData.category,
        unit: newIngredientData.unit,
        isPublic: true, // Default to public for community access
        description: `Ingrédient créé lors de la création d'une recette`
      });

      // Update the form with the created ingredient
      setSelectedIngredient(createdIngredient);
      setNewIngredient(prev => ({
        ...prev,
        name: createdIngredient.name,
        category: createdIngredient.category
      }));

      setShowCreateDialog(false);
      setNewIngredientData({ name: '', price: '', category: 'Autres', unit: '' });
    } catch (error) {
      console.error('Error creating ingredient:', error);
      setCreateError(error.message || 'Erreur lors de la création de l\'ingrédient');
    } finally {
      setIsCreatingIngredient(false);
    }
  };

  // Add ingredient to recipe
  const handleAddToRecipe = () => {
    if (!newIngredient.name.trim() || !newIngredient.quantity || !newIngredient.unit.trim()) {
      return;
    }

    const ingredient = {
      name: newIngredient.name.trim(),
      quantity: parseFloat(newIngredient.quantity),
      unit: newIngredient.unit.trim(),
      category: newIngredient.category || 'Autres'
    };

    onAddIngredient(ingredient);
    
    // Reset form
    setNewIngredient({ name: '', quantity: '', unit: '', category: '' });
    setSelectedIngredient(null);
    setInputValue('');
  };

  // Check if we need to create a new ingredient
  const needsCreation = newIngredient.name.trim() && !selectedIngredient && !findExistingIngredient(newIngredient.name);

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Autocomplete
            freeSolo
            options={ingredients}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            value={selectedIngredient}
            inputValue={inputValue}
            onChange={handleIngredientChange}
            onInputChange={handleInputChange}
            loading={ingredientsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nom de l'ingrédient"
                error={!!error}
                helperText={needsCreation ? "Nouvel ingrédient - prix requis" : ""}
                sx={{ minWidth: '300px' }} // Increased width as requested
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {ingredientsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.category} • {option.price ? `${option.price} FCFA` : 'Prix inconnu'}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Quantité"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
            inputProps={{ min: 0, step: 0.1 }}
          />
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <Autocomplete
            freeSolo
            options={COMMON_UNITS}
            value={newIngredient.unit}
            onChange={(event, value) => setNewIngredient({...newIngredient, unit: value || ''})}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unité"
                placeholder="g, ml, pièces..."
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={newIngredient.category}
              onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
              label="Catégorie"
            >
              {SHOPPING_CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={1}>
          {needsCreation ? (
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={handleCreateNewIngredient}
              sx={{ height: '56px' }}
              startIcon={<Warning />}
            >
              Créer
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAddToRecipe}
              sx={{ height: '56px' }}
              disabled={!newIngredient.name.trim() || !newIngredient.quantity || !newIngredient.unit.trim()}
            >
              <Add />
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Unit Suggestions */}
      {newIngredient.name.trim() && (
        <UnitSuggestions
          ingredientName={newIngredient.name}
          onUnitSelect={(unit) => setNewIngredient({...newIngredient, unit})}
        />
      )}

      {/* New Ingredient Creation Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            <Typography variant="h6">
              Créer un Nouvel Ingrédient
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Cet ingrédient n'existe pas dans notre base de données. Voulez-vous le créer pour la communauté ?
          </Alert>
          
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'ingrédient"
                value={newIngredientData.name}
                onChange={(e) => setNewIngredientData({...newIngredientData, name: e.target.value})}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Prix (FCFA)"
                value={newIngredientData.price}
                onChange={(e) => setNewIngredientData({...newIngredientData, price: e.target.value})}
                required
                inputProps={{ min: 0, step: 1 }}
                helperText="Prix moyen au marché"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={newIngredientData.category}
                  onChange={(e) => setNewIngredientData({...newIngredientData, category: e.target.value})}
                  label="Catégorie"
                >
                  {SHOPPING_CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={COMMON_UNITS}
                value={newIngredientData.unit}
                onChange={(event, value) => setNewIngredientData({...newIngredientData, unit: value || ''})}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Unité principale"
                    helperText="Unité utilisée pour le prix (ex: kg, L, pièces)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Annuler
          </Button>
          <Button
            onClick={confirmCreateIngredient}
            variant="contained"
            disabled={isCreatingIngredient || !newIngredientData.name.trim() || !newIngredientData.price}
            startIcon={isCreatingIngredient ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {isCreatingIngredient ? 'Création...' : 'Créer l\'Ingrédient'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EnhancedIngredientInput;
