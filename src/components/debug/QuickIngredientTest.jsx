/**
 * 🚀 Quick Ingredient Test Component
 * Simple test for immediate ingredient creation and verification
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useIngredients } from '../../contexts/IngredientContext';

function QuickIngredientTest() {
  const { currentUser } = useAuth();
  const { family } = useFamily();
  const {
    ingredients,
    addIngredient,
    loading,
    error,
    familyIngredients
  } = useIngredients();

  const [isCreating, setIsCreating] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [ingredientName, setIngredientName] = useState('Test Ingredient ' + Date.now());

  const createTestIngredient = async () => {
    setIsCreating(true);
    setTestError(null);
    setTestResult(null);

    try {
      console.log('🧪 Creating quick test ingredient:', ingredientName);

      const testIngredient = {
        name: ingredientName,
        description: 'Ingrédient de test rapide - PUBLIC',
        price: 500,
        category: 'Autres',
        unit: 'pièce',
        isPublic: true, // Changed to true for maximum visibility
        aliases: ['test'],
        notes: 'Test rapide de création d\'ingrédient - VISIBLE PAR TOUTES LES FAMILLES',
        storageInstructions: 'Test storage',
        averageShelfLife: 7,
        seasonality: [],
        tags: ['test', 'rapide', 'public']
      };

      const result = await addIngredient(testIngredient);

      console.log('✅ Test ingredient created:', result);
      setTestResult({
        success: true,
        ingredient: result,
        message: `Ingrédient "${result.name}" créé avec succès!`
      });

      // Generate new name for next test
      setIngredientName('Test Ingredient ' + Date.now());

    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestError(error.message);
      setTestResult({
        success: false,
        message: `Échec: ${error.message}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  const clearResults = () => {
    setTestResult(null);
    setTestError(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🚀 Test Rapide d'Ingrédient
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Test simple et rapide de création d'ingrédient avec vérification immédiate.
      </Typography>

      {/* État actuel */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 État Actuel
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Utilisateur:</strong> {currentUser ? currentUser.email : 'Non connecté'}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Famille:</strong> {family ? family.name : 'Aucune famille'}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Ingrédients famille:</strong> {familyIngredients.length}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Total ingrédients:</strong> {ingredients.length}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Erreurs */}
      {(error || testError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || testError}
        </Alert>
      )}

      {/* Résultat du test */}
      {testResult && (
        <Alert
          severity={testResult.success ? "success" : "error"}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={clearResults}>
              Effacer
            </Button>
          }
        >
          {testResult.message}
        </Alert>
      )}

      {/* Contrôles de test */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ Test Rapide
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom de l'ingrédient de test"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              disabled={isCreating}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={isCreating ? <CircularProgress size={20} /> : <Add />}
              onClick={createTestIngredient}
              disabled={isCreating || !currentUser || !family?.id || !ingredientName.trim()}
              fullWidth
            >
              {isCreating ? 'Création...' : 'Créer Test'}
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              disabled={isCreating}
              fullWidth
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>

        {!currentUser && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Veuillez vous connecter pour tester la création d'ingrédients.
          </Alert>
        )}

        {currentUser && !family?.id && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Veuillez rejoindre une famille pour tester la création d'ingrédients.
          </Alert>
        )}
      </Paper>

      {/* Ingrédients de la famille */}
      {familyIngredients.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            👨‍👩‍👧‍👦 Ingrédients de la Famille ({familyIngredients.length})
          </Typography>

          <List dense>
            {familyIngredients.slice(0, 10).map((ingredient) => (
              <ListItem key={ingredient.id}>
                <ListItemText
                  primary={ingredient.name}
                  secondary={`${ingredient.price} FCFA/${ingredient.unit} - ${ingredient.category}`}
                />
                <Chip
                  label={ingredient.tags?.includes('test') ? 'Test' : 'Normal'}
                  color={ingredient.tags?.includes('test') ? 'secondary' : 'default'}
                  size="small"
                />
              </ListItem>
            ))}
            {familyIngredients.length > 10 && (
              <ListItem>
                <ListItemText
                  primary={`... et ${familyIngredients.length - 10} autres ingrédients`}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      )}

      {/* Statistiques */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {ingredients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Ingrédients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="secondary">
                {familyIngredients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingrédients Famille
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color={loading ? "warning.main" : "success.main"}>
                {loading ? 'Chargement...' : 'Prêt'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Statut Système
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          📝 Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. <strong>Connectez-vous</strong> et rejoignez une famille
        </Typography>
        <Typography variant="body2" paragraph>
          2. <strong>Modifiez le nom</strong> de l'ingrédient de test si nécessaire
        </Typography>
        <Typography variant="body2" paragraph>
          3. <strong>Cliquez sur "Créer Test"</strong> pour créer un nouvel ingrédient
        </Typography>
        <Typography variant="body2" paragraph>
          4. <strong>Vérifiez</strong> que l'ingrédient apparaît dans la liste des ingrédients famille
        </Typography>
        <Typography variant="body2">
          5. <strong>Consultez la console</strong> du navigateur pour les logs détaillés
        </Typography>
      </Paper>
    </Box>
  );
}

export default QuickIngredientTest;
