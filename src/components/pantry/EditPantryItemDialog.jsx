/**
 * Edit Pantry Item Dialog for MiamBidi
 * Allows editing of existing pantry items with expiration tracking
 */

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
  Alert,
  CircularProgress,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Close,
  Save,
  CalendarToday,
  LocationOn,
  AttachMoney
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { usePantry } from '../../contexts/PantryContext';
import { useNotification } from '../../contexts/NotificationContext';
import { STORAGE_LOCATIONS, INGREDIENT_UNITS } from '../../types/ingredient';

const COMMON_UNITS = INGREDIENT_UNITS.map(unit => unit.name);

function EditPantryItemDialog({ open, onClose, item }) {
  const { updatePantryItem } = usePantry();
  const { showNotification } = useNotification();

  // Form state
  const [formData, setFormData] = useState({
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

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        quantity: item.quantity?.toString() || '',
        unit: item.unit || '',
        daysUntilExpiry: item.daysUntilExpiry?.toString() || '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        location: item.location || 'Garde-manger',
        purchasePrice: item.purchasePrice?.toString() || '',
        supplier: item.supplier || '',
        notes: item.notes || ''
      });
    }
  }, [item]);

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
      const updates = {
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null,
        location: formData.location,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        supplier: formData.supplier.trim(),
        notes: formData.notes.trim()
      };

      await updatePantryItem(item.id, updates);
      showNotification('Ingrédient mis à jour !', 'success');
      onClose();
    } catch (error) {
      console.error('Error updating pantry item:', error);
      setError(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Get expiration status for display
  const getExpirationStatus = () => {
    if (!formData.expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(formData.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { status: 'expired', color: 'error', text: 'Expiré' };
    if (diffDays < 3) return { status: 'critical', color: 'error', text: 'Critique' };
    if (diffDays <= 7) return { status: 'warning', color: 'warning', text: 'Attention' };
    return { status: 'fresh', color: 'success', text: 'Frais' };
  };

  const expirationStatus = getExpirationStatus();

  if (!item) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Modifier : {item.ingredientName}
            </Typography>
            <Button onClick={onClose} color="inherit">
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

          {/* Expiration Status Alert */}
          {expirationStatus && (
            <Alert severity={expirationStatus.color} sx={{ mb: 3 }}>
              État d'expiration : {expirationStatus.text}
              {formData.daysUntilExpiry && (
                <Typography variant="body2">
                  {parseInt(formData.daysUntilExpiry) > 0 
                    ? `Expire dans ${formData.daysUntilExpiry} jour(s)`
                    : `Expiré depuis ${Math.abs(parseInt(formData.daysUntilExpiry))} jour(s)`
                  }
                </Typography>
              )}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Ingredient Name (Read-only) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'ingrédient"
                value={item.ingredientName}
                disabled
                variant="filled"
              />
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
                helperText={`Quantité originale : ${item.originalQuantity || 'N/A'} ${item.unit}`}
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Modifiez la date d'expiration"
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

            {/* Usage History */}
            {item.usageHistory && item.usageHistory.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Historique d'Utilisation
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  {item.usageHistory.slice(-5).reverse().map((usage, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {new Date(usage.date).toLocaleDateString('fr-FR')} - 
                        {usage.quantityBefore} → {usage.quantityAfter} {item.unit}
                        {usage.reason && ` (${usage.reason})`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.quantity || !formData.unit}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Mise à jour...' : 'Mettre à Jour'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default EditPantryItemDialog;
