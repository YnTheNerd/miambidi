import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useRecipes } from '../../contexts/RecipeContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';

function FamilyRecipeDebug() {
  const {
    getAllRecipes,
    getPrivateRecipes,
    getFamilyRecipes,
    getPublicRecipes,
    addRecipe,
    VISIBILITY_TYPES,
    loading: recipesLoading,
    error: recipesError
  } = useRecipes();
  
  const {
    currentUser,
    currentFamily,
    family,
    familyMembers,
    loading: familyLoading,
    error: familyError
  } = useFamily();

  const [debugInfo, setDebugInfo] = useState({});
  const [testRecipeCreated, setTestRecipeCreated] = useState(false);

  // Gather debug information
  useEffect(() => {
    const info = {
      // User info
      currentUser: currentUser ? {
        id: currentUser.id,
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      } : null,
      
      // Family info
      currentFamily: currentFamily ? {
        id: currentFamily.id,
        name: currentFamily.name,
        members: currentFamily.members
      } : null,
      
      family: family ? {
        id: family.id,
        name: family.name,
        members: family.members
      } : null,
      
      // Recipe counts
      allRecipes: getAllRecipes().length,
      privateRecipes: getPrivateRecipes(currentUser?.id).length,
      familyRecipes: getFamilyRecipes(currentFamily?.id).length,
      publicRecipes: getPublicRecipes().length,
      
      // Loading states
      recipesLoading,
      familyLoading,
      
      // Errors
      recipesError,
      familyError
    };
    
    setDebugInfo(info);
  }, [currentUser, currentFamily, family, getAllRecipes, getPrivateRecipes, getFamilyRecipes, getPublicRecipes, recipesLoading, familyLoading, recipesError, familyError]);

  // Create a test family recipe
  const createTestFamilyRecipe = async () => {
    if (!currentFamily) {
      alert('Aucune famille configurée. Veuillez créer une famille d\'abord.');
      return;
    }

    try {
      const testRecipe = {
        name: 'Recette Test Familiale',
        description: 'Une recette de test pour vérifier le système familial',
        imageUrl: '/images/recipes/default-meal.jpg',
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: 'Facile',
        cuisine: 'camerounaise',
        categories: ['test'],
        visibility: VISIBILITY_TYPES.FAMILY,
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isDairyFree: false,
          containsNuts: false,
          allergens: []
        },
        ingredients: [
          { name: 'Ingrédient test', quantity: 1, unit: 'kg', category: 'Autres' }
        ],
        instructions: [
          'Étape de test pour vérifier la création de recette familiale'
        ],
        tips: [],
        nutrition: {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 5,
          fiber: 3
        }
      };

      const result = await addRecipe(testRecipe);
      if (result) {
        setTestRecipeCreated(true);
        alert('Recette test créée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la recette test:', error);
      alert('Erreur lors de la création de la recette test: ' + error.message);
    }
  };

  // Get detailed recipe information
  const allRecipes = getAllRecipes();
  const privateRecipes = getPrivateRecipes(currentUser?.id);
  const familyRecipes = getFamilyRecipes(currentFamily?.id);
  const publicRecipes = getPublicRecipes();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Debug: Recettes Familiales 🔍
      </Typography>
      
      {/* Loading States */}
      {(recipesLoading || familyLoading) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Chargement en cours... (Recettes: {recipesLoading ? 'Oui' : 'Non'}, Famille: {familyLoading ? 'Oui' : 'Non'})
        </Alert>
      )}

      {/* Error States */}
      {(recipesError || familyError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erreurs détectées:
          {recipesError && <div>Recettes: {recipesError}</div>}
          {familyError && <div>Famille: {familyError}</div>}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Debug Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations de Debug
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Utilisateur Actuel:
            </Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '12px' }}>
                {JSON.stringify(debugInfo.currentUser, null, 2)}
              </pre>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Famille Actuelle (currentFamily):
            </Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '12px' }}>
                {JSON.stringify(debugInfo.currentFamily, null, 2)}
              </pre>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Famille (family):
            </Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '12px' }}>
                {JSON.stringify(debugInfo.family, null, 2)}
              </pre>
            </Box>
          </Paper>
        </Grid>

        {/* Recipe Counts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compteurs de Recettes
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {debugInfo.allRecipes || 0}
                    </Typography>
                    <Typography variant="body2">
                      Toutes les Recettes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {debugInfo.privateRecipes || 0}
                    </Typography>
                    <Typography variant="body2">
                      Recettes Privées
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary.main">
                      {debugInfo.familyRecipes || 0}
                    </Typography>
                    <Typography variant="body2">
                      Recettes Familiales
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {debugInfo.publicRecipes || 0}
                    </Typography>
                    <Typography variant="body2">
                      Recettes Publiques
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={createTestFamilyRecipe}
                disabled={!currentFamily || testRecipeCreated}
                fullWidth
              >
                {testRecipeCreated ? 'Recette Test Créée ✓' : 'Créer Recette Test Familiale'}
              </Button>
              {!currentFamily && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  Aucune famille configurée. Allez à /family pour créer une famille.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Family Recipes List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recettes Familiales Détaillées ({familyRecipes.length})
            </Typography>
            
            {familyRecipes.length === 0 ? (
              <Alert severity="info">
                Aucune recette familiale trouvée.
                {!currentFamily && ' (Aucune famille configurée)'}
              </Alert>
            ) : (
              <List>
                {familyRecipes.map((recipe, index) => (
                  <React.Fragment key={recipe.id}>
                    <ListItem>
                      <ListItemText
                        primary={recipe.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {recipe.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip label={`Visibilité: ${recipe.visibility}`} size="small" sx={{ mr: 1 }} />
                              <Chip label={`Famille: ${recipe.familyId}`} size="small" sx={{ mr: 1 }} />
                              <Chip label={`Créé par: ${recipe.createdBy}`} size="small" />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < familyRecipes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FamilyRecipeDebug;
