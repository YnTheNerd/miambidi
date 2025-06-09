/**
 * Recipe Recommendation Dialog for MiamBidi
 * Suggests recipes based on available pantry ingredients
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Close,
  Restaurant,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useRecipes } from '../../contexts/RecipeContext';
import { findEquivalence, canConvert } from '../../utils/unitEquivalence';
import { IngredientAvailabilityChip } from '../common/UnitEquivalenceDisplay';

function RecipeRecommendationDialog({ open, onClose, ingredients, filterType, selectedIngredients = null }) {
  const { getPrivateRecipes, getFamilyRecipes, getPublicRecipes } = useRecipes();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get filter type display name
  const getFilterDisplayName = () => {
    switch (filterType) {
      case 'fresh': return 'ingrédients frais';
      case 'warning': return 'ingrédients à consommer bientôt';
      case 'critical': return 'ingrédients critiques';
      case 'expired': return 'ingrédients expirés';
      default: return 'tous vos ingrédients';
    }
  };

  // Find recipe recommendations
  useEffect(() => {
    if (!open || ingredients.length === 0) return;

    const findRecommendations = async () => {
      setLoading(true);
      setError('');

      try {
        // Get all available recipes
        const [privateRecipes, familyRecipes, publicRecipes] = await Promise.all([
          getPrivateRecipes(),
          getFamilyRecipes(), 
          getPublicRecipes()
        ]);

        const allRecipes = [...privateRecipes, ...familyRecipes, ...publicRecipes];

        // Use selected ingredients if provided, otherwise use all filtered ingredients
        const targetIngredients = selectedIngredients && selectedIngredients.length > 0
          ? selectedIngredients
          : ingredients;
        const ingredientNames = targetIngredients.map(ing => ing.ingredientName.toLowerCase());

        // Enhanced algorithm: Find recipes that use ANY of the selected/available pantry ingredients
        const matchedRecipes = allRecipes
          .map(recipe => {
            const recipeIngredients = recipe.ingredients || [];

            // Find matches: recipe ingredients that are available in pantry (with unit equivalence)
            const matches = recipeIngredients.filter(recipeIng => {
              return targetIngredients.some(pantryItem => {
                const nameMatch = recipeIng.name.toLowerCase().includes(pantryItem.ingredientName.toLowerCase()) ||
                                pantryItem.ingredientName.toLowerCase().includes(recipeIng.name.toLowerCase());

                if (!nameMatch) return false;

                // Check if we have enough quantity (with unit conversion if possible)
                if (recipeIng.quantity && recipeIng.unit && pantryItem.quantity && pantryItem.unit) {
                  const conversion = findEquivalence(
                    pantryItem.ingredientName,
                    pantryItem.quantity,
                    pantryItem.unit,
                    recipeIng.unit
                  );

                  if (conversion) {
                    return conversion.quantity >= recipeIng.quantity;
                  } else if (pantryItem.unit === recipeIng.unit) {
                    return pantryItem.quantity >= recipeIng.quantity;
                  }
                }

                return true; // Name match is sufficient if quantities can't be compared
              });
            });

            // Calculate metrics
            const matchCount = matches.length;
            const totalIngredients = recipeIngredients.length;
            const matchPercentage = totalIngredients > 0 ? (matchCount / totalIngredients) * 100 : 0;

            // Enhanced priority scoring for ANY ingredient matching:
            // - Heavily prioritize recipes using MORE of the selected ingredients
            // - Bonus for higher match percentage
            // - Small bonus for recipe rating
            const priorityScore = (matchCount * matchCount * 1000) + // Quadratic weight for match count
                                (matchPercentage * 50) +              // Percentage bonus
                                ((recipe.rating || 0) * 10);         // Rating bonus

            // Find missing ingredients (not available in pantry with sufficient quantity)
            const missingIngredients = recipeIngredients.filter(recipeIng => {
              return !targetIngredients.some(pantryItem => {
                const nameMatch = recipeIng.name.toLowerCase().includes(pantryItem.ingredientName.toLowerCase()) ||
                                pantryItem.ingredientName.toLowerCase().includes(recipeIng.name.toLowerCase());

                if (!nameMatch) return false;

                // Check if we have enough quantity (with unit conversion if possible)
                if (recipeIng.quantity && recipeIng.unit && pantryItem.quantity && pantryItem.unit) {
                  const conversion = findEquivalence(
                    pantryItem.ingredientName,
                    pantryItem.quantity,
                    pantryItem.unit,
                    recipeIng.unit
                  );

                  if (conversion) {
                    return conversion.quantity >= recipeIng.quantity;
                  } else if (pantryItem.unit === recipeIng.unit) {
                    return pantryItem.quantity >= recipeIng.quantity;
                  }
                }

                return true; // Name match is sufficient if quantities can't be compared
              });
            });

            return {
              ...recipe,
              matchCount,
              matchedIngredients: matches,
              matchPercentage: Math.round(matchPercentage),
              priorityScore,
              missingIngredients,
              // Additional metrics for better sorting
              missingCount: missingIngredients.length,
              availabilityRatio: totalIngredients > 0 ? matchCount / totalIngredients : 0
            };
          })
          .filter(recipe => recipe.matchCount >= 1) // Only show recipes using at least 1 available ingredient
          .sort((a, b) => {
            // Primary sort: recipes using MORE selected ingredients come first
            if (b.matchCount !== a.matchCount) {
              return b.matchCount - a.matchCount;
            }
            // Secondary sort: higher availability ratio (fewer missing ingredients)
            if (Math.abs(b.availabilityRatio - a.availabilityRatio) > 0.01) {
              return b.availabilityRatio - a.availabilityRatio;
            }
            // Tertiary sort: priority score
            return b.priorityScore - a.priorityScore;
          })
          .slice(0, 20); // Show top 20 recommendations

        setRecommendations(matchedRecipes);
      } catch (error) {
        console.error('Error finding recipe recommendations:', error);
        setError('Erreur lors de la recherche de recettes');
      } finally {
        setLoading(false);
      }
    };

    findRecommendations();
  }, [open, ingredients, getPrivateRecipes, getFamilyRecipes, getPublicRecipes]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Restaurant color="primary" />
            <Typography variant="h6">
              {selectedIngredients && selectedIngredients.length > 0
                ? `Recettes avec ${selectedIngredients.length} ingrédient(s) sélectionné(s)`
                : 'Recettes Recommandées'
              }
            </Typography>
          </Box>
          <Button onClick={onClose} color="inherit">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          {selectedIngredients && selectedIngredients.length > 0
            ? `Recettes utilisant vos ${selectedIngredients.length} ingrédient(s) sélectionné(s) spécifiquement`
            : `Recettes utilisant ${getFilterDisplayName()} (${ingredients.length} ingrédients disponibles)`
          }
        </Alert>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune recette trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aucune recette ne correspond aux ingrédients sélectionnés.
              Essayez d'ajouter plus d'ingrédients à votre garde-manger ou consultez toutes les recettes.
            </Typography>
          </Box>
        )}

        {!loading && recommendations.length > 0 && (
          <List>
            {recommendations.map((recipe, index) => (
              <React.Fragment key={recipe.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      src={recipe.imageUrl || recipe.image}
                      sx={{ width: 60, height: 60 }}
                    >
                      <Restaurant />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {recipe.name}
                        </Typography>
                        <Chip
                          label={`${recipe.matchCount}/${recipe.ingredients?.length || 0} ingrédients`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={`${recipe.matchPercentage}% compatible`}
                          color={recipe.matchPercentage > 70 ? 'success' : recipe.matchPercentage > 40 ? 'warning' : 'default'}
                          size="small"
                        />
                        {recipe.missingCount > 0 && (
                          <Chip
                            label={`${recipe.missingCount} manquant(s)`}
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {recipe.description}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Ingrédients disponibles dans votre garde-manger :
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {recipe.matchedIngredients.map((ingredient, idx) => (
                            <Chip
                              key={idx}
                              label={ingredient.name}
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<CheckCircle />}
                            />
                          ))}
                        </Box>

                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1 }}>
                              Ingrédients manquants ({recipe.missingIngredients.length}) :
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {recipe.missingIngredients.slice(0, 5).map((ingredient, idx) => (
                                <Chip
                                  key={idx}
                                  label={ingredient.name}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              ))}
                              {recipe.missingIngredients.length > 5 && (
                                <Chip
                                  label={`+${recipe.missingIngredients.length - 5} autre(s)`}
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </>
                        )}

                        {filterType === 'critical' || filterType === 'warning' ? (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label="Utilise des ingrédients à consommer rapidement"
                              size="small"
                              color="warning"
                              icon={<Warning />}
                            />
                          </Box>
                        ) : null}
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < recommendations.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Fermer
        </Button>
        {recommendations.length > 0 && (
          <Button variant="contained" onClick={onClose}>
            Voir Toutes les Recettes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default RecipeRecommendationDialog;
