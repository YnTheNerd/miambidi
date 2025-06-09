/**
 * Recipe Test Component for MiamBidi
 * Tests recipe CRUD operations with Firestore
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Restaurant, Add, Refresh, Delete } from '@mui/icons-material';
import { useRecipes } from '../../contexts/RecipeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';

function RecipeTest() {
  const [testRecipe, setTestRecipe] = useState({
    name: 'Test Ndolé',
    description: 'Recette de test pour vérifier la persistance Firestore',
    ingredients: [
      { name: 'Feuilles de ndolé', quantity: 200, unit: 'g', category: 'Légumes' },
      { name: 'Crevettes', quantity: 100, unit: 'g', category: 'Viandes & Poissons' }
    ],
    instructions: [
      'Nettoyer les feuilles de ndolé',
      'Faire cuire avec les crevettes',
      'Servir chaud'
    ],
    prepTime: 15,
    cookTime: 30,
    servings: '2 personnes',
    difficulty: 'Facile',
    cuisine: 'Camerounaise',
    category: 'Plat principal',
    visibility: 'family',
    tags: ['Test'],
    imageUrl: '/images/recipes/default-meal.jpg'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const { 
    recipes, 
    addRecipe, 
    updateRecipe, 
    deleteRecipe, 
    getAllRecipes,
    loading: recipesLoading,
    error: recipesError 
  } = useRecipes();
  
  const { currentUser } = useAuth();
  const { currentFamily } = useFamily();

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAddTestRecipe = async () => {
    setLoading(true);
    try {
      const result = await addRecipe(testRecipe);
      showMessage(`Recette créée avec succès! ID: ${result.id}`, 'success');
    } catch (error) {
      showMessage(`Erreur lors de la création: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTestRecipe = async () => {
    const testRecipes = recipes.filter(r => r.name === 'Test Ndolé');
    if (testRecipes.length === 0) {
      showMessage('Aucune recette de test trouvée à modifier', 'warning');
      return;
    }

    setLoading(true);
    try {
      const recipeToUpdate = testRecipes[0];
      await updateRecipe(recipeToUpdate.id, {
        description: 'Recette de test MODIFIÉE - ' + new Date().toLocaleTimeString(),
        prepTime: 20
      });
      showMessage('Recette modifiée avec succès!', 'success');
    } catch (error) {
      showMessage(`Erreur lors de la modification: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestRecipe = async () => {
    const testRecipes = recipes.filter(r => r.name === 'Test Ndolé');
    if (testRecipes.length === 0) {
      showMessage('Aucune recette de test trouvée à supprimer', 'warning');
      return;
    }

    setLoading(true);
    try {
      await deleteRecipe(testRecipes[0].id);
      showMessage('Recette supprimée avec succès!', 'success');
    } catch (error) {
      showMessage(`Erreur lors de la suppression: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRecipes = () => {
    showMessage('Actualisation des recettes...', 'info');
    // The real-time listener should automatically update the recipes
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Restaurant sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h1">
            Test de Persistance des Recettes
          </Typography>
        </Box>

        {/* Status Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            État de la Connexion:
          </Typography>
          <Alert severity={currentUser && currentFamily ? 'success' : 'warning'}>
            Utilisateur: {currentUser ? currentUser.email : 'Non connecté'}<br/>
            Famille: {currentFamily ? currentFamily.name : 'Non configurée'}
          </Alert>
        </Box>

        {/* Messages */}
        {message && (
          <Alert severity={messageType} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* Recipe Loading Status */}
        {recipesLoading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            Chargement des recettes...
          </Alert>
        )}

        {recipesError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erreur: {recipesError}
          </Alert>
        )}

        {/* Test Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Actions de Test:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Add />}
              onClick={handleAddTestRecipe}
              disabled={loading || !currentUser || !currentFamily}
            >
              Créer Recette Test
            </Button>
            
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              onClick={handleUpdateTestRecipe}
              disabled={loading || !currentUser}
            >
              Modifier Recette Test
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
              onClick={handleDeleteTestRecipe}
              disabled={loading || !currentUser}
            >
              Supprimer Recette Test
            </Button>
            
            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={handleRefreshRecipes}
            >
              Actualiser
            </Button>
          </Box>
        </Box>

        {/* Recipe List */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Recettes Chargées ({recipes.length}):
          </Typography>
          {recipes.length === 0 ? (
            <Alert severity="info">
              Aucune recette trouvée. Utilisez le seeder ou créez une recette de test.
            </Alert>
          ) : (
            <List>
              {recipes.map((recipe, index) => (
                <React.Fragment key={recipe.id}>
                  <ListItem>
                    <ListItemText
                      primary={recipe.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {recipe.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visibilité: {recipe.visibility} | 
                            Créé par: {recipe.createdBy} | 
                            Famille: {recipe.familyId || 'Public'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recipes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Test Recipe Data */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Données de la Recette de Test:
          </Typography>
          <TextField
            fullWidth
            label="Nom de la recette"
            value={testRecipe.name}
            onChange={(e) => setTestRecipe({...testRecipe, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={testRecipe.description}
            onChange={(e) => setTestRecipe({...testRecipe, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Visibilité</InputLabel>
            <Select
              value={testRecipe.visibility}
              onChange={(e) => setTestRecipe({...testRecipe, visibility: e.target.value})}
            >
              <MenuItem value="private">Privée</MenuItem>
              <MenuItem value="family">Famille</MenuItem>
              <MenuItem value="public">Publique</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
    </Box>
  );
}

export default RecipeTest;
