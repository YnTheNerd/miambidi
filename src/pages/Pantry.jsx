/**
 * Enhanced Pantry Management Page for MiamBidi
 * Comprehensive pantry management with expiration tracking and recipe recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Alert,
  Fab,
  Badge,
  Tooltip,
  CircularProgress,
  Divider,
  ButtonGroup,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FilterList,
  Restaurant,
  Warning,
  CheckCircle,
  CheckBox,
  Error,
  Notifications,
  ShoppingCart,
  Refresh,
  Search,
  Sort,
  Clear
} from '@mui/icons-material';
import { usePantry } from '../contexts/PantryContext';
import { useFamily } from '../contexts/FirestoreFamilyContext';
import { useNotification } from '../contexts/NotificationContext';
import AddPantryItemDialog from '../components/pantry/AddPantryItemDialog';
import EditPantryItemDialog from '../components/pantry/EditPantryItemDialog';
import PantryStatsCard from '../components/pantry/PantryStatsCard';
import RecipeRecommendationDialog from '../components/pantry/RecipeRecommendationDialog';

// Expiration status constants
const EXPIRATION_STATUS = {
  FRESH: 'fresh',
  WARNING: 'warning', 
  CRITICAL: 'critical',
  EXPIRED: 'expired'
};

const EXPIRATION_FILTERS = [
  { key: 'all', label: 'Tous', icon: <FilterList /> },
  { key: EXPIRATION_STATUS.FRESH, label: 'Frais (>7j)', icon: <CheckCircle />, color: 'success' },
  { key: EXPIRATION_STATUS.WARNING, label: 'Attention (3-7j)', icon: <Warning />, color: 'warning' },
  { key: EXPIRATION_STATUS.CRITICAL, label: 'Critique (<3j)', icon: <Error />, color: 'error' },
  { key: EXPIRATION_STATUS.EXPIRED, label: 'Expirés', icon: <Error />, color: 'error' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Par Nom (A-Z)' },
  { value: 'name_desc', label: 'Par Nom (Z-A)' },
  { value: 'expiry', label: 'Par Date d\'Expiration' },
  { value: 'quantity', label: 'Par Quantité (croissant)' },
  { value: 'quantity_desc', label: 'Par Quantité (décroissant)' },
  { value: 'recent', label: 'Récemment Ajoutés' },
  { value: 'category', label: 'Par Catégorie' },
  { value: 'location', label: 'Par Emplacement' },
  { value: 'price', label: 'Par Prix (croissant)' },
  { value: 'price_desc', label: 'Par Prix (décroissant)' }
];

function Pantry() {
  const {
    pantryItems,
    expiringItems,
    expiredItems,
    loading,
    error,
    removePantryItem,
    getPantryStats
  } = usePantry();
  
  const { currentFamily } = useFamily();
  const { showNotification } = useNotification();

  // State management
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('expiry');

  // Get expiration status for an item
  const getExpirationStatus = (item) => {
    if (!item.expiryDate) return null;
    
    if (item.isExpired) return EXPIRATION_STATUS.EXPIRED;
    
    const days = item.daysUntilExpiry;
    if (days <= 0) return EXPIRATION_STATUS.EXPIRED;
    if (days < 3) return EXPIRATION_STATUS.CRITICAL;
    if (days <= 7) return EXPIRATION_STATUS.WARNING;
    return EXPIRATION_STATUS.FRESH;
  };

  // Get color for expiration status
  const getExpirationColor = (status) => {
    switch (status) {
      case EXPIRATION_STATUS.FRESH: return '#4caf50'; // Green
      case EXPIRATION_STATUS.WARNING: return '#ff9800'; // Orange
      case EXPIRATION_STATUS.CRITICAL: return '#f44336'; // Red
      case EXPIRATION_STATUS.EXPIRED: return '#9e9e9e'; // Gray
      default: return '#2196f3'; // Blue for no expiration
    }
  };

  // Filter and sort items based on selected filter, search term, and sort option
  useEffect(() => {
    let filtered = [...pantryItems];

    // Apply expiration filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => {
        const status = getExpirationStatus(item);
        return status === selectedFilter;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        // Search in ingredient name
        if (item.ingredientName.toLowerCase().includes(normalizedSearch)) {
          return true;
        }

        // Search in location
        if (item.location && item.location.toLowerCase().includes(normalizedSearch)) {
          return true;
        }

        // Search in notes
        if (item.notes && item.notes.toLowerCase().includes(normalizedSearch)) {
          return true;
        }

        // Search in supplier
        if (item.supplier && item.supplier.toLowerCase().includes(normalizedSearch)) {
          return true;
        }

        return false;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.ingredientName.localeCompare(b.ingredientName, 'fr');
        case 'name_desc':
          return b.ingredientName.localeCompare(a.ingredientName, 'fr');
        case 'expiry':
          // Sort by expiration date (soonest first) then by name
          if (a.expiryDate && b.expiryDate) {
            return new Date(a.expiryDate) - new Date(b.expiryDate);
          }
          if (a.expiryDate && !b.expiryDate) return -1;
          if (!a.expiryDate && b.expiryDate) return 1;
          return a.ingredientName.localeCompare(b.ingredientName, 'fr');
        case 'quantity':
          return a.quantity - b.quantity;
        case 'quantity_desc':
          return b.quantity - a.quantity;
        case 'recent':
          return new Date(b.lastUpdated || b.createdAt || 0) - new Date(a.lastUpdated || a.createdAt || 0);
        case 'category':
          return (a.category || 'Autres').localeCompare(b.category || 'Autres', 'fr');
        case 'location':
          return (a.location || 'Non spécifié').localeCompare(b.location || 'Non spécifié', 'fr');
        case 'price':
          return (a.purchasePrice || 0) - (b.purchasePrice || 0);
        case 'price_desc':
          return (b.purchasePrice || 0) - (a.purchasePrice || 0);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [pantryItems, selectedFilter, searchTerm, sortBy]);

  // Handle item deletion
  const handleDeleteItem = async (item) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer "${item.ingredientName}" du garde-manger ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await removePantryItem(item.id);
        showNotification(`${item.ingredientName} supprimé du garde-manger`, 'success');
      } catch (error) {
        console.error('Error deleting pantry item:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  // Get notification count for expiring/expired items
  const getNotificationCount = () => {
    return expiringItems.length + expiredItems.length;
  };

  // Format expiration display
  const formatExpirationDisplay = (item) => {
    if (!item.expiryDate) return 'Pas d\'expiration';
    
    const status = getExpirationStatus(item);
    const days = item.daysUntilExpiry;
    
    if (status === EXPIRATION_STATUS.EXPIRED) {
      return `Expiré depuis ${Math.abs(days)} jour(s)`;
    }
    
    return `Expire dans ${days} jour(s)`;
  };

  // Handle ingredient selection
  const handleIngredientSelect = (item) => {
    setSelectedIngredients(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Handle selection mode toggle
  const handleSelectionModeToggle = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedIngredients([]);
    }
  };

  // Handle targeted recommendations
  const handleTargetedRecommendations = () => {
    if (selectedIngredients.length > 0) {
      setShowRecommendationDialog(true);
    }
  };

  // Get pantry statistics
  const stats = getPantryStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header with notifications */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Garde-Manger 🏠
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez votre stock d'ingrédients avec suivi d'expiration
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Add Ingredient Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Ajouter Ingrédient
          </Button>

          {/* Notification Bell */}
          <Tooltip title={`${getNotificationCount()} ingrédients nécessitent votre attention`}>
            <IconButton color={getNotificationCount() > 0 ? 'error' : 'default'}>
              <Badge badgeContent={getNotificationCount()} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Refresh Button */}
          <Tooltip title="Actualiser">
            <IconButton onClick={() => window.location.reload()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Expiration Notifications */}
      {(expiringItems.length > 0 || expiredItems.length > 0) && (
        <Alert 
          severity={expiredItems.length > 0 ? 'error' : 'warning'} 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setSelectedFilter('critical')}>
              Voir
            </Button>
          }
        >
          {expiredItems.length > 0 && (
            <Typography variant="body2">
              ⚠️ {expiredItems.length} ingrédient(s) expiré(s)
            </Typography>
          )}
          {expiringItems.length > 0 && (
            <Typography variant="body2">
              🔔 {expiringItems.length} ingrédient(s) vont expirer dans moins de 7 jours
            </Typography>
          )}
        </Alert>
      )}

      {/* Statistics Cards */}
      <PantryStatsCard stats={stats} />

      {/* Search and Sort Controls */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Rechercher et Trier
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, emplacement, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Trier par"
                startAdornment={
                  <InputAdornment position="start">
                    <Sort />
                  </InputAdornment>
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Filter Buttons */}
        <Typography variant="h6" gutterBottom>
          Filtrer par État d'Expiration
        </Typography>
        <ButtonGroup variant="outlined" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {EXPIRATION_FILTERS.map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? 'contained' : 'outlined'}
              color={filter.color || 'primary'}
              startIcon={filter.icon}
              onClick={() => setSelectedFilter(filter.key)}
              sx={{ mb: 1 }}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>

        {/* Selection Mode Controls */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sélection d'Ingrédients
          </Typography>
          <Button
            variant={selectionMode ? 'contained' : 'outlined'}
            color="secondary"
            startIcon={selectionMode ? <CheckCircle /> : <CheckBox />}
            onClick={handleSelectionModeToggle}
            sx={{ mr: 2 }}
          >
            {selectionMode ? 'Annuler Sélection' : 'Sélectionner Ingrédients'}
          </Button>

          {selectionMode && selectedIngredients.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Restaurant />}
              onClick={handleTargetedRecommendations}
            >
              Recettes avec {selectedIngredients.length} sélectionné(s)
            </Button>
          )}

          {selectionMode && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              {selectedIngredients.length > 0
                ? `${selectedIngredients.length} ingrédient(s) sélectionné(s) pour les recommandations`
                : 'Cliquez sur les ingrédients pour les sélectionner'
              }
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Recipe Recommendation Button */}
      {filteredItems.length > 0 && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<Restaurant />}
            onClick={() => setShowRecommendationDialog(true)}
            sx={{ px: 4 }}
          >
            Proposer des Recettes
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Trouvez des recettes utilisant vos ingrédients
            {selectedFilter !== 'all' && ' filtrés'}
          </Typography>
        </Box>
      )}

      {/* Pantry Items Grid */}
      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedFilter === 'all' 
              ? 'Votre garde-manger est vide' 
              : `Aucun ingrédient dans la catégorie "${EXPIRATION_FILTERS.find(f => f.key === selectedFilter)?.label}"`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedFilter === 'all' 
              ? 'Commencez par ajouter des ingrédients à votre stock'
              : 'Essayez un autre filtre ou ajoutez de nouveaux ingrédients'
            }
          </Typography>
          {selectedFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
            >
              Ajouter un Ingrédient
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => {
            const status = getExpirationStatus(item);
            const statusColor = getExpirationColor(status);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: `4px solid ${statusColor}`,
                    cursor: selectionMode ? 'pointer' : 'default',
                    bgcolor: selectionMode && selectedIngredients.some(selected => selected.id === item.id)
                      ? 'action.selected'
                      : 'background.paper',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                      bgcolor: selectionMode
                        ? selectedIngredients.some(selected => selected.id === item.id)
                          ? 'action.selected'
                          : 'action.hover'
                        : 'background.paper'
                    }
                  }}
                  onClick={selectionMode ? () => handleIngredientSelect(item) : undefined}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap sx={{ flexGrow: 1 }}>
                        {item.ingredientName}
                      </Typography>
                      {selectionMode && (
                        <CheckBox
                          checked={selectedIngredients.some(selected => selected.id === item.id)}
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="h4" color="primary" gutterBottom>
                      {item.quantity} {item.unit}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={formatExpirationDisplay(item)}
                        size="small"
                        sx={{
                          bgcolor: statusColor,
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                    
                    {item.location && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📍 {item.location}
                      </Typography>
                    )}
                    
                    {item.purchasePrice && (
                      <Typography variant="body2" color="text.secondary">
                        💰 {item.purchasePrice} FCFA
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditItem(item)}
                    >
                      Modifier
                    </Button>
                    
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowAddDialog(true)}
      >
        <Add />
      </Fab>

      {/* Dialogs */}
      <AddPantryItemDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
      
      {selectedItem && (
        <EditPantryItemDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
        />
      )}
      
      <RecipeRecommendationDialog
        open={showRecommendationDialog}
        onClose={() => setShowRecommendationDialog(false)}
        ingredients={filteredItems}
        filterType={selectedFilter}
        selectedIngredients={selectionMode && selectedIngredients.length > 0 ? selectedIngredients : null}
      />
    </Box>
  );
}

export default Pantry;
