/**
 * Enhanced Add Pantry Item Dialog for MiamBidi
 * Integrates with EnhancedIngredientInput for ingredient selection/creation
 */

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
  Alert,
  CircularProgress,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Close,
  Save,
  Add,
  CalendarToday,
  LocationOn,
  AttachMoney
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { usePantry } from '../../contexts/PantryContext';
import { useIngredients } from '../../contexts/IngredientContext';
import { useNotification } from '../../contexts/NotificationContext';
import { STORAGE_LOCATIONS, INGREDIENT_UNITS } from '../../types/ingredient';

const COMMON_UNITS = INGREDIENT_UNITS.map(unit => unit.name);

function AddPantryItemDialog({ open, onClose }) {
  const { addPantryItem } = usePantry();
  const { ingredients, addIngredient } = useIngredients();
  const { showNotification } = useNotification();

  // Form state
  const [formData, setFormData] = useState({
    ingredientName: '',
    quantity: '',
    unit: '',
    daysUntilExpiry: '',
    expiryDate: null,
    location: 'Garde-manger',
    purchasePrice: '',
    supplier: '',
    notes: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    price: '',
    category: 'Autres',
    unit: ''
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);

  // Find existing ingredient
  const findExistingIngredient = (name) => {
    if (!name) return null;
    const normalizedName = name.toLowerCase().trim();
    return ingredients.find(ing => 
      ing.name.toLowerCase().trim() === normalizedName ||
      ing.searchTerms?.some(term => term.toLowerCase() === normalizedName)
    );
  };

  // Handle ingredient selection
  const handleIngredientChange = (event, value, reason) => {
    if (reason === 'selectOption') {
      setSelectedIngredient(value);
      setFormData(prev => ({
        ...prev,
        ingredientName: value.name,
        unit: value.unit || prev.unit
      }));
    } else if (reason === 'clear') {
      setSelectedIngredient(null);
      setFormData(prev => ({ ...prev, ingredientName: '', unit: '' }));
    }
  };

  // Handle input value change
  const handleInputChange = (event, value, reason) => {
    setInputValue(value);
    
    if (reason === 'input') {
      const existing = findExistingIngredient(value);
      if (existing) {
        setSelectedIngredient(existing);
        setFormData(prev => ({
          ...prev,
          ingredientName: existing.name,
          unit: existing.unit || prev.unit
        }));
      } else {
        setSelectedIngredient(null);
        setFormData(prev => ({
          ...prev,
          ingredientName: value
        }));
      }
    }
  };

  // Handle creating new ingredient
  const handleCreateNewIngredient = () => {
    if (!formData.ingredientName.trim()) return;
    
    const existing = findExistingIngredient(formData.ingredientName);
    if (existing) {
      setSelectedIngredient(existing);
      setFormData(prev => ({
        ...prev,
        ingredientName: existing.name,
        unit: existing.unit || prev.unit
      }));
      return;
    }

    setNewIngredientData({
      name: formData.ingredientName.trim(),
      price: '',
      category: 'Autres',
      unit: formData.unit || 'g'
    });
    setShowCreateDialog(true);
  };

  // Confirm ingredient creation
  const confirmCreateIngredient = async () => {
    if (!newIngredientData.name.trim() || !newIngredientData.price || newIngredientData.price <= 0) {
      setError('Veuillez remplir tous les champs requis avec des valeurs valides.');
      return;
    }

    setIsCreatingIngredient(true);
    try {
      const createdIngredient = await addIngredient({
        name: newIngredientData.name.trim(),
        price: parseFloat(newIngredientData.price),
        category: newIngredientData.category,
        unit: newIngredientData.unit,
        isPublic: true,
        description: 'Ingrédient créé depuis le garde-manger'
      });

      setSelectedIngredient(createdIngredient);
      setFormData(prev => ({
        ...prev,
        ingredientName: createdIngredient.name,
        unit: createdIngredient.unit
      }));

      setShowCreateDialog(false);
      setNewIngredientData({ name: '', price: '', category: 'Autres', unit: '' });
      showNotification('Ingrédient créé avec succès !', 'success');
    } catch (error) {
      console.error('Error creating ingredient:', error);
      setError(error.message || 'Erreur lors de la création de l\'ingrédient');
    } finally {
      setIsCreatingIngredient(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate expiry date when days are entered
    if (field === 'daysUntilExpiry' && value) {
      const days = parseInt(value);
      if (days > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        setFormData(prev => ({ ...prev, expiryDate }));
      }
    }
  };

  // Handle expiry date change
  const handleExpiryDateChange = (date) => {
    setFormData(prev => ({ ...prev, expiryDate: date }));
    
    // Auto-calculate days until expiry
    if (date) {
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData(prev => ({ ...prev, daysUntilExpiry: diffDays.toString() }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.ingredientName.trim()) {
      setError('Le nom de l\'ingrédient est requis');
      return false;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('La quantité doit être supérieure à 0');
      return false;
    }
    if (!formData.unit.trim()) {
      setError('L\'unité est requise');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const pantryItemData = {
        ingredientId: selectedIngredient?.id || null,
        ingredientName: formData.ingredientName.trim(),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null,
        location: formData.location,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        supplier: formData.supplier.trim(),
        notes: formData.notes.trim(),
        purchaseDate: new Date().toISOString()
      };

      await addPantryItem(pantryItemData);
      showNotification('Ingrédient ajouté au garde-manger !', 'success');
      handleClose();
    } catch (error) {
      console.error('Error adding pantry item:', error);
      setError(error.message || 'Erreur lors de l\'ajout au garde-manger');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData({
      ingredientName: '',
      quantity: '',
      unit: '',
      daysUntilExpiry: '',
      expiryDate: null,
      location: 'Garde-manger',
      purchasePrice: '',
      supplier: '',
      notes: ''
    });
    setSelectedIngredient(null);
    setInputValue('');
    setError('');
    setShowCreateDialog(false);
    onClose();
  };

  // Check if ingredient needs creation
  const needsCreation = formData.ingredientName.trim() && !selectedIngredient && !findExistingIngredient(formData.ingredientName);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Ajouter un Ingrédient au Garde-Manger
            </Typography>
            <Button onClick={handleClose} color="inherit">
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Ingredient Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Sélection de l'Ingrédient
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Autocomplete
                  freeSolo
                  options={ingredients}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={selectedIngredient}
                  inputValue={inputValue}
                  onChange={handleIngredientChange}
                  onInputChange={handleInputChange}
                  sx={{ flexGrow: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nom de l'ingrédient"
                      required
                      helperText={needsCreation ? "Nouvel ingrédient - création requise" : ""}
                      sx={{ minWidth: '300px' }} // Increased width as requested
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
                
                {needsCreation && (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleCreateNewIngredient}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Créer
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Quantity and Unit */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantité"
                value={formData.quantity}
                onChange={handleFieldChange('quantity')}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <Autocomplete
                freeSolo
                options={COMMON_UNITS}
                value={formData.unit}
                onChange={(event, value) => setFormData(prev => ({ ...prev, unit: value || '' }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Unité"
                    required
                  />
                )}
              />
            </Grid>

            {/* Expiration Tracking */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Suivi d'Expiration
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Jours avant expiration"
                value={formData.daysUntilExpiry}
                onChange={handleFieldChange('daysUntilExpiry')}
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CalendarToday /></InputAdornment>
                }}
                helperText="Laissez vide si pas d'expiration"
              />
            </Grid>
            
            <Grid item xs={6}>
              <DatePicker
                label="Date d'expiration"
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Sélectionnez la date d'expiration"
                  }
                }}
              />
            </Grid>

            {/* Storage and Purchase Info */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Lieu de stockage</InputLabel>
                <Select
                  value={formData.location}
                  onChange={handleFieldChange('location')}
                  label="Lieu de stockage"
                  startAdornment={<LocationOn />}
                >
                  {STORAGE_LOCATIONS.map(location => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Prix d'achat (FCFA)"
                value={formData.purchasePrice}
                onChange={handleFieldChange('purchasePrice')}
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fournisseur"
                value={formData.supplier}
                onChange={handleFieldChange('supplier')}
                placeholder="Où avez-vous acheté cet ingrédient ?"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={handleFieldChange('notes')}
                placeholder="Notes additionnelles..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.ingredientName.trim() || !formData.quantity || !formData.unit}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Ajout...' : 'Ajouter au Garde-Manger'}
          </Button>
        </DialogActions>

        {/* Ingredient Creation Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Créer un Nouvel Ingrédient</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Cet ingrédient n'existe pas. Créez-le pour la communauté !
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de l'ingrédient"
                  value={newIngredientData.name}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Prix (FCFA)"
                  value={newIngredientData.price}
                  onChange={(e) => setNewIngredientData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unité"
                  value={newIngredientData.unit}
                  onChange={(e) => setNewIngredientData(prev => ({ ...prev, unit: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button
              onClick={confirmCreateIngredient}
              variant="contained"
              disabled={isCreatingIngredient}
            >
              {isCreatingIngredient ? 'Création...' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    </LocalizationProvider>
  );
}

export default AddPantryItemDialog;
