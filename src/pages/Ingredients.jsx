/**
 * Enhanced Ingredients Page for MiamBidi
 * Comprehensive ingredient management with search, filtering, and CRUD operations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Edit,
  Delete,
  Restaurant,
  ViewList,
  ViewModule,
  Sort,
  Public,
  Lock,
  TrendingUp,
  Category,
  Euro
} from '@mui/icons-material';
import { useIngredients } from '../contexts/IngredientContext';
import { useFamily } from '../contexts/FirestoreFamilyContext';
import { INGREDIENT_CATEGORIES } from '../types/ingredient';
import AddIngredientDialog from '../components/ingredients/AddIngredientDialog';
import EditIngredientDialog from '../components/ingredients/EditIngredientDialog';
import IngredientCard from '../components/ingredients/IngredientCard';
import IngredientListItem from '../components/ingredients/IngredientListItem';

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'name_desc', label: 'Nom (Z-A)' },
  { value: 'price', label: 'Prix (croissant)' },
  { value: 'price_desc', label: 'Prix (décroissant)' },
  { value: 'category', label: 'Catégorie' },
  { value: 'usage', label: 'Plus utilisés' },
  { value: 'recent', label: 'Récemment ajoutés' }
];

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

function Ingredients() {
  const {
    ingredients,
    familyIngredients,
    publicIngredients,
    loading,
    error,
    deleteIngredient,
    searchIngredients,
    getIngredientsByCategory,
    isSearching
  } = useIngredients();
  const { family } = useFamily();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showFamilyOnly, setShowFamilyOnly] = useState(false);

  // Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // Search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchIngredients(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchIngredients]);

  // Filter and sort ingredients
  const filteredAndSortedIngredients = React.useMemo(() => {
    let result = ingredients;

    // Apply visibility filters
    if (showPublicOnly) {
      result = publicIngredients;
    } else if (showFamilyOnly) {
      result = familyIngredients;
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(ingredient => ingredient.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchLower) ||
        ingredient.normalizedName?.includes(searchLower) ||
        ingredient.description?.toLowerCase().includes(searchLower) ||
        ingredient.aliases?.some(alias => alias.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'fr');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'fr');
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'category':
          return a.category.localeCompare(b.category, 'fr');
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return result;
  }, [
    ingredients,
    publicIngredients,
    familyIngredients,
    selectedCategory,
    searchTerm,
    sortBy,
    showPublicOnly,
    showFamilyOnly
  ]);

  // Group ingredients by category for statistics
  const ingredientsByCategory = React.useMemo(() => {
    const grouped = {};
    filteredAndSortedIngredients.forEach(ingredient => {
      const category = ingredient.category || 'Autres';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(ingredient);
    });
    return grouped;
  }, [filteredAndSortedIngredients]);

  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditDialogOpen(true);
  };

  const handleDeleteIngredient = async (ingredient) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${ingredient.name}" ?`)) {
      try {
        await deleteIngredient(ingredient.id);
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'FCFA');
  };

  const canEditIngredient = (ingredient) => {
    return ingredient.familyId === family?.id ||
           (!ingredient.isPublic && ingredient.createdBy === family?.adminId);
  };

  if (loading) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Chargement des ingrédients...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Récupération des données depuis la base de données
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Error Alert (non-blocking) */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => {}}>
          <Typography variant="body2">
            {error}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Les ingrédients publics restent disponibles. Vérifiez votre connexion ou contactez l'administrateur.
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box mb={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestion des Ingrédients
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez votre base de données d'ingrédients avec prix et catégories
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
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
      </Box>

      {/* Status indicators */}
      <Box mb={3}>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            icon={<Public />}
            label={`${publicIngredients.length} ingrédients publics`}
            color="info"
            variant="outlined"
            size="small"
          />
          {family?.id && (
            <Chip
              icon={<Lock />}
              label={`${familyIngredients.length} ingrédients famille`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          {!family?.id && (
            <Chip
              icon={<Lock />}
              label="Connectez-vous à une famille pour gérer vos ingrédients privés"
              color="default"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher un ingrédient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? <CircularProgress size={20} /> : <Search />}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={selectedCategory}
                label="Catégorie"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">
                  <em>Toutes les catégories</em>
                </MenuItem>
                {INGREDIENT_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortBy}
                label="Trier par"
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* View Mode */}
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              fullWidth
            >
              <ToggleButton value={VIEW_MODES.GRID}>
                <ViewModule />
              </ToggleButton>
              <ToggleButton value={VIEW_MODES.LIST}>
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Reset Filters */}
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('name');
                setShowPublicOnly(false);
                setShowFamilyOnly(false);
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {/* Visibility Filters */}
        <Box mt={2}>
          <ToggleButtonGroup
            value={showPublicOnly ? 'public' : showFamilyOnly ? 'family' : 'all'}
            exclusive
            onChange={(e, value) => {
              setShowPublicOnly(value === 'public');
              setShowFamilyOnly(value === 'family');
            }}
            size="small"
          >
            <ToggleButton value="all">
              Tous ({ingredients.length})
            </ToggleButton>
            <ToggleButton value="family">
              <Lock sx={{ mr: 1 }} />
              Famille ({familyIngredients.length})
            </ToggleButton>
            <ToggleButton value="public">
              <Public sx={{ mr: 1 }} />
              Public ({publicIngredients.length})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Statistics */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredAndSortedIngredients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingrédients affichés
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {Object.keys(ingredientsByCategory).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Catégories
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {familyIngredients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingrédients famille
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Math.round(filteredAndSortedIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0) / filteredAndSortedIngredients.length) || 0} FCFA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prix moyen
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Ingredients Display */}
      {filteredAndSortedIngredients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Aucun ingrédient trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {searchTerm || selectedCategory
              ? 'Aucun ingrédient ne correspond à vos critères de recherche.'
              : 'Commencez par ajouter des ingrédients à votre base de données.'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
          >
            Ajouter un ingrédient
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredAndSortedIngredients.map((ingredient) => (
            <Grid
              item
              xs={12}
              sm={viewMode === VIEW_MODES.GRID ? 6 : 12}
              md={viewMode === VIEW_MODES.GRID ? 4 : 12}
              lg={viewMode === VIEW_MODES.GRID ? 3 : 12}
              key={ingredient.id}
            >
              {viewMode === VIEW_MODES.GRID ? (
                <IngredientCard
                  ingredient={ingredient}
                  onEdit={handleEditIngredient}
                  onDelete={handleDeleteIngredient}
                  canEdit={canEditIngredient(ingredient)}
                  formatPrice={formatPrice}
                />
              ) : (
                <IngredientListItem
                  ingredient={ingredient}
                  onEdit={handleEditIngredient}
                  onDelete={handleDeleteIngredient}
                  canEdit={canEditIngredient(ingredient)}
                  formatPrice={formatPrice}
                />
              )}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Ajouter un ingrédient"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Dialogs */}
      <AddIngredientDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />

      {editDialogOpen && selectedIngredient && (
        <EditIngredientDialog
          open={editDialogOpen}
          ingredient={selectedIngredient}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedIngredient(null);
          }}
        />
      )}
    </Box>
  );
}

export default Ingredients;
