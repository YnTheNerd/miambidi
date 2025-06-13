import React, { useState } from 'react';
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
  Autocomplete,
  Paper,
  Divider,
  Button,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Restaurant,
  Favorite,
  FavoriteBorder,
  Lock,
  Group,
  Public
} from '@mui/icons-material';
import { useRecipes } from '../contexts/RecipeContext';
import { useFamily } from '../contexts/FirestoreFamilyContext';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeDialog from '../components/recipes/RecipeDialog';
import EditRecipeDialog from '../components/recipes/EditRecipeDialog';
import AddRecipeDialog from '../components/recipes/AddRecipeDialog';
import RecipeCardErrorBoundary from '../components/common/RecipeCardErrorBoundary';
import DynamicRecipeGrid from '../components/recipes/DynamicRecipeGrid';

// Import existing cuisine categories from EditMemberDialog
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

const DIFFICULTY_LEVELS = ['Facile', 'Moyen', 'Difficile'];

function Recipes() {
  const {
    getAllRecipes,
    getPrivateRecipes,
    getFamilyRecipes,
    getPublicRecipes,
    filterRecipes,
    updateRecipe,
    addRecipe,
    deleteRecipe,
    changeRecipeVisibility,
    VISIBILITY_TYPES,
    loading: recipesLoading,
    error: recipesError
  } = useRecipes();
  const { currentUser, currentFamily, familyMembers, loading: familyLoading, error: familyError } = useFamily();

  const [currentTab, setCurrentTab] = useState(0); // 0: Private, 1: Family, 2: Public
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem('recipe-favorites');
    return savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [editRecipeDialogOpen, setEditRecipeDialogOpen] = useState(false);
  const [addRecipeDialogOpen, setAddRecipeDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  // Get recipes based on current tab
  const getRecipesByTab = () => {
    switch (currentTab) {
      case 0: // Private recipes
        return getPrivateRecipes(currentUser?.id);
      case 1: // Family recipes
        return getFamilyRecipes(currentFamily?.id);
      case 2: // Public recipes
        return getPublicRecipes();
      default:
        return [];
    }
  };

  // Get filtered recipes for current tab
  const baseRecipes = getRecipesByTab();
  const filteredRecipes = baseRecipes.filter(recipe => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = recipe.name.toLowerCase().includes(searchLower);
      const descMatch = recipe.description.toLowerCase().includes(searchLower);
      const ingredientMatch = recipe.ingredients.some(ing =>
        ing.name.toLowerCase().includes(searchLower)
      );
      if (!nameMatch && !descMatch && !ingredientMatch) {
        return false;
      }
    }

    // Apply cuisine filter
    if (selectedCuisine && recipe.cuisine !== selectedCuisine) {
      return false;
    }

    // Apply categories filter
    if (selectedCategories.length > 0) {
      const hasCategory = selectedCategories.some(cat =>
        recipe.categories.includes(cat)
      );
      if (!hasCategory) return false;
    }

    // Apply dietary restrictions filter
    if (selectedDietary.length > 0) {
      if (selectedDietary.includes('végétarien') && !recipe.dietaryInfo.isVegetarian) {
        return false;
      }
      if (selectedDietary.includes('végan') && !recipe.dietaryInfo.isVegan) {
        return false;
      }
      if (selectedDietary.includes('sans gluten') && !recipe.dietaryInfo.isGlutenFree) {
        return false;
      }
      if (selectedDietary.includes('sans produits laitiers') && !recipe.dietaryInfo.isDairyFree) {
        return false;
      }
    }

    // Apply difficulty filter
    if (selectedDifficulty && recipe.difficulty !== selectedDifficulty) {
      return false;
    }

    // Apply favorites filter
    if (showFavoritesOnly && !favorites.has(recipe.id)) {
      return false;
    }

    return true;
  });

  // Get recipe counts for each tab
  const privateRecipes = getPrivateRecipes(currentUser?.id);
  const familyRecipes = getFamilyRecipes(currentFamily?.id);
  const publicRecipes = getPublicRecipes();

  const handleToggleFavorite = (recipeId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        newFavorites.add(recipeId);
      }

      // Persist to localStorage
      localStorage.setItem('recipe-favorites', JSON.stringify([...newFavorites]));

      return newFavorites;
    });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    // Clear filters when switching tabs
    clearFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('');
    setSelectedCategories([]);
    setSelectedDietary([]);
    setSelectedDifficulty('');
    setShowFavoritesOnly(false);
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDialogOpen(true);
  };

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setEditRecipeDialogOpen(true);
  };

  const handleSaveRecipe = async (updatedRecipe) => {
    try {
      const success = await updateRecipe(updatedRecipe.id, updatedRecipe);
      if (success) {
        setSuccessMessage('Recette modifiée avec succès !');
        setShowSuccessSnackbar(true);
        setEditRecipeDialogOpen(false);
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSuccessMessage('Erreur lors de la modification de la recette');
      setShowSuccessSnackbar(true);
    }
  };

  const handleAddRecipe = () => {
    setAddRecipeDialogOpen(true);
  };

  const handleSaveNewRecipe = async (newRecipeData) => {
    try {
      const newRecipe = await addRecipe(newRecipeData);
      if (newRecipe) {
        setSuccessMessage('Nouvelle recette créée avec succès !');
        setShowSuccessSnackbar(true);
        setAddRecipeDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      setSuccessMessage('Erreur lors de la création de la recette');
      setShowSuccessSnackbar(true);
    }
  };

  const handleDeleteRecipe = async (recipe) => {
    const isAdmin = currentUser?.role === 'admin';
    const isCreator = currentUser?.id === recipe.createdBy;

    // Create confirmation message based on user role
    let confirmMessage = `Êtes-vous sûr de vouloir supprimer la recette "${recipe.name}" ?`;

    if (isAdmin && !isCreator) {
      confirmMessage += '\n\nEn tant qu\'administrateur familial, vous avez le droit de supprimer cette recette créée par un membre de votre famille.';
    }

    if (recipe.visibility === 'public') {
      confirmMessage += '\n\nAttention : Cette recette publique sera définitivement supprimée pour tous les utilisateurs.';
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteRecipe(recipe.id, isAdmin, currentFamily?.id);
        setSuccessMessage('Recette supprimée avec succès !');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Error deleting recipe:', error);
        setSuccessMessage(error.message || 'Erreur lors de la suppression de la recette');
        setShowSuccessSnackbar(true);
      }
    }
  };

  const handleShareRecipe = (recipe) => {
    // TODO: Implement share functionality
    console.log('Share recipe:', recipe);
  };

  const handleAddToShoppingList = (recipe) => {
    // TODO: Implement add to shopping list functionality
    console.log('Add to shopping list:', recipe);
  };

  // Combined loading state
  const isLoading = recipesLoading || familyLoading;

  // Combined error state
  const error = recipesError || familyError;

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Box sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Chargement des recettes...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Récupération des données de la famille et des recettes
        </Typography>
      </Box>
    );
  }

  // Handle case where user doesn't have family context
  if (!currentUser) {
    return (
      <Box sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Contexte familial requis
          </Typography>
          <Typography variant="body2">
            Vous devez être connecté et faire partie d'une famille pour accéder aux recettes.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/dashboard'}
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Collection de Recettes MiamBidi 🍽️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos recettes personnelles, familiales et découvrez la communauté
        </Typography>
      </Box>

      {/* Recipe Collection Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          <Tab
            icon={<Lock />}
            label={
              <Badge badgeContent={privateRecipes.length} color="warning" max={99}>
                <Box sx={{ ml: 1 }}>Mes Recettes Personnelles</Box>
              </Badge>
            }
            iconPosition="start"
            sx={{ color: 'warning.main' }}
          />
          <Tab
            icon={<Group />}
            label={
              <Badge badgeContent={familyRecipes.length} color="primary" max={99}>
                <Box sx={{ ml: 1 }}>Recettes Familiales</Box>
              </Badge>
            }
            iconPosition="start"
            sx={{ color: 'primary.main' }}
          />
          <Tab
            icon={<Public />}
            label={
              <Badge badgeContent={publicRecipes.length} color="success" max={99}>
                <Box sx={{ ml: 1 }}>Recettes Publiques</Box>
              </Badge>
            }
            iconPosition="start"
            sx={{ color: 'success.main' }}
          />
        </Tabs>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher des recettes, ingrédients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Filter Toggle */}
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
            >
              Filtres
            </Button>
          </Grid>

          {/* Favorites Filter */}
          <Grid item xs={12} md={2}>
            <Button
              variant={showFavoritesOnly ? "contained" : "outlined"}
              startIcon={showFavoritesOnly ? <Favorite /> : <FavoriteBorder />}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              fullWidth
              color={showFavoritesOnly ? "error" : "primary"}
            >
              Favoris
            </Button>
          </Grid>

          {/* Add Recipe Button */}
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddRecipe}
              fullWidth
            >
              Ajouter une Recette
            </Button>
          </Grid>
        </Grid>

        {/* Expanded Filters */}
        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {/* Cuisine Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Cuisine</InputLabel>
                  <Select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    label="Cuisine"
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    <MenuItem value="camerounaise">Camerounaise</MenuItem>
                    <MenuItem value="africaine">Africaine</MenuItem>
                    <MenuItem value="libanaise">Libanaise</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Categories Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  multiple
                  options={CUISINE_CATEGORIES}
                  value={selectedCategories}
                  onChange={(_, newValue) => setSelectedCategories(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          size="small"
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Catégories"
                      placeholder="Sélectionner..."
                    />
                  )}
                />
              </Grid>

              {/* Dietary Restrictions Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  multiple
                  options={DIETARY_RESTRICTIONS}
                  value={selectedDietary}
                  onChange={(_, newValue) => setSelectedDietary(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          size="small"
                          color="secondary"
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Restrictions"
                      placeholder="Sélectionner..."
                    />
                  )}
                />
              </Grid>

              {/* Difficulty Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Difficulté</InputLabel>
                  <Select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    label="Difficulté"
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    {DIFFICULTY_LEVELS.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Clear Filters */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={clearFilters} color="secondary">
                Effacer les filtres
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {filteredRecipes.length} recette{filteredRecipes.length !== 1 ? 's' : ''} trouvée{filteredRecipes.length !== 1 ? 's' : ''}
        </Typography>
        {showFavoritesOnly && (
          <Chip
            icon={<Favorite />}
            label="Favoris uniquement"
            color="error"
            variant="outlined"
            onDelete={() => setShowFavoritesOnly(false)}
          />
        )}
        {favorites.size > 0 && (
          <Typography variant="body2" color="text.secondary">
            • {favorites.size} favori{favorites.size !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {/* Dynamic Recipe Grid - Masonry-style Layout */}
      <DynamicRecipeGrid recipes={filteredRecipes}>
        {filteredRecipes.map((recipe) => (
          <RecipeCardErrorBoundary key={recipe.id} recipe={recipe}>
            <RecipeCard
              recipe={recipe}
              currentUserId={currentUser?.id}
              currentFamilyId={currentFamily?.id}
              currentFamilyName={currentFamily?.name}
              isAdmin={currentUser?.role === 'admin'}
              onView={handleViewRecipe}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
              onShare={handleShareRecipe}
              isFavorite={favorites.has(recipe.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </RecipeCardErrorBoundary>
        ))}
      </DynamicRecipeGrid>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          {showFavoritesOnly ? (
            <>
              <Favorite sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune recette favorite trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {favorites.size === 0
                  ? "Vous n'avez pas encore de recettes favorites. Cliquez sur le cœur pour ajouter des recettes à vos favoris."
                  : "Aucune de vos recettes favorites ne correspond aux filtres actuels."
                }
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowFavoritesOnly(false)}
                sx={{ mr: 2 }}
              >
                Voir Toutes les Recettes
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddRecipe}>
                Ajouter une Recette
              </Button>
            </>
          ) : (
            <>
              <Restaurant sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune recette trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Essayez de modifier vos critères de recherche ou ajoutez une nouvelle recette
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddRecipe}>
                Ajouter une Recette
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Recipe Detail Dialog */}
      <RecipeDialog
        open={recipeDialogOpen}
        recipe={selectedRecipe}
        onClose={() => {
          setRecipeDialogOpen(false);
          setSelectedRecipe(null);
        }}
        currentUserId={currentUser?.id}
        onEdit={handleEditRecipe}
        onAddToShoppingList={handleAddToShoppingList}
        isFavorite={selectedRecipe ? favorites.has(selectedRecipe.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Edit Recipe Dialog */}
      <EditRecipeDialog
        open={editRecipeDialogOpen}
        recipe={selectedRecipe}
        onClose={() => {
          setEditRecipeDialogOpen(false);
          setSelectedRecipe(null);
        }}
        onSave={handleSaveRecipe}
      />

      {/* Add Recipe Dialog */}
      <AddRecipeDialog
        open={addRecipeDialogOpen}
        onClose={() => setAddRecipeDialogOpen(false)}
        onSave={handleSaveNewRecipe}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Recipes;
