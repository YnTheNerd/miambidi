/**
 * 🧪 Test Component for Ingredient Saving Functionality
 * Comprehensive testing of ingredient creation, saving, and real-time updates
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Restaurant,
  CheckCircle,
  Error,
  PlayArrow,
  Refresh,
  Search,
  Save,
  Visibility,
  Public,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useIngredients } from '../../contexts/IngredientContext';
import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from '../../types/ingredient';

const TEST_INGREDIENTS = [
  {
    name: 'Tomate Fraîche Test',
    description: 'Tomate rouge fraîche pour test de sauvegarde',
    price: 400,
    category: 'Légumes-feuilles & Aromates',
    unit: 'kg',
    isPublic: true, // Changed to true for maximum visibility
    aliases: ['Tomate rouge', 'Tomate'],
    notes: 'Ingrédient de test créé automatiquement - PUBLIC',
    storageInstructions: 'Conserver à température ambiante',
    averageShelfLife: 7,
    seasonality: ['Juin', 'Juillet', 'Août'],
    tags: ['test', 'légume', 'frais', 'public']
  },
  {
    name: 'Riz Basmati Test',
    description: 'Riz basmati de qualité pour test',
    price: 2000,
    category: 'Céréales & Légumineuses',
    unit: 'kg',
    isPublic: true, // Already public, keeping it
    aliases: ['Riz parfumé', 'Basmati'],
    notes: 'Riz de test avec visibilité publique',
    storageInstructions: 'Conserver dans un récipient hermétique',
    averageShelfLife: 365,
    tags: ['test', 'céréale', 'public']
  }
];

const TEST_STEPS = [
  'Vérification des prérequis',
  'Création des ingrédients de test',
  'Vérification de la sauvegarde',
  'Test de recherche',
  'Validation des données'
];

function IngredientSaveTest() {
  const { currentUser } = useAuth();
  const { family } = useFamily();
  const {
    ingredients,
    addIngredient,
    searchIngredients,
    loading,
    error,
    publicIngredients,
    familyIngredients
  } = useIngredients();

  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testError, setTestError] = useState(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [createdIngredients, setCreatedIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const addTestResult = (step, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      step,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString('fr-FR')
    }]);
  };

  const runComprehensiveTest = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResults([]);
    setCreatedIngredients([]);
    setActiveStep(0);

    try {
      // Étape 1: Vérification des prérequis
      addTestResult(0, 'running', 'Vérification des prérequis...');

      if (!currentUser) {
        throw new Error('Utilisateur non authentifié');
      }
      if (!family?.id) {
        throw new Error('Aucune famille assignée');
      }

      addTestResult(0, 'success', `Utilisateur: ${currentUser.email}, Famille: ${family.name}`);
      setActiveStep(1);

      // Étape 2: Création des ingrédients de test
      addTestResult(1, 'running', 'Création des ingrédients de test...');

      const createdItems = [];
      for (const testIngredient of TEST_INGREDIENTS) {
        try {
          console.log('🧪 Creating test ingredient:', testIngredient.name);
          const result = await addIngredient(testIngredient);
          createdItems.push(result);
          addTestResult(1, 'success', `Ingrédient créé: ${result.name} (ID: ${result.id})`);
        } catch (error) {
          addTestResult(1, 'error', `Échec création ${testIngredient.name}: ${error.message}`);
          throw error;
        }
      }

      setCreatedIngredients(createdItems);
      setActiveStep(2);

      // Étape 3: Vérification de la sauvegarde (attendre les mises à jour en temps réel)
      addTestResult(2, 'running', 'Vérification de la sauvegarde...');

      // Fonction pour attendre qu'un ingrédient apparaisse dans la liste
      const waitForIngredientInList = async (ingredientId, maxWaitTime = 10000) => {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
          const found = ingredients.find(ing => ing.id === ingredientId);
          if (found) {
            return found;
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // Vérifier toutes les 500ms
        }
        return null;
      };

      let foundCount = 0;
      let verificationErrors = [];

      for (const created of createdItems) {
        addTestResult(2, 'running', `Recherche de ${created.name} dans la liste...`);

        try {
          // Attendre que l'ingrédient apparaisse dans la liste (max 10 secondes)
          const found = await waitForIngredientInList(created.id);

          if (found) {
            foundCount++;
            addTestResult(2, 'success', `✅ Ingrédient trouvé: ${found.name}`);

            // Vérifier la structure des données en détail
            const requiredFields = {
              id: found.id,
              name: found.name,
              normalizedName: found.normalizedName,
              searchTerms: found.searchTerms,
              familyId: found.familyId,
              createdAt: found.createdAt,
              updatedAt: found.updatedAt,
              price: found.price,
              category: found.category,
              unit: found.unit
            };

            const missingFields = Object.entries(requiredFields)
              .filter(([key, value]) => !value)
              .map(([key]) => key);

            if (missingFields.length === 0) {
              addTestResult(2, 'success', `✅ Structure complète pour: ${found.name}`);

              // Vérifier les données spécifiques
              if (found.familyId === family.id) {
                addTestResult(2, 'success', `✅ FamilyId correct: ${found.familyId}`);
              } else {
                addTestResult(2, 'warning', `⚠️ FamilyId incorrect: ${found.familyId} vs ${family.id}`);
              }

              if (Array.isArray(found.searchTerms) && found.searchTerms.length > 0) {
                addTestResult(2, 'success', `✅ Search terms générés: ${found.searchTerms.length} termes`);
              } else {
                addTestResult(2, 'warning', `⚠️ Search terms manquants ou vides`);
              }

            } else {
              addTestResult(2, 'warning', `⚠️ Champs manquants pour ${found.name}: ${missingFields.join(', ')}`);
              verificationErrors.push(`${found.name}: ${missingFields.join(', ')}`);
            }
          } else {
            addTestResult(2, 'error', `❌ Ingrédient non trouvé après 10s: ${created.name}`);
            verificationErrors.push(`${created.name}: non trouvé dans la liste`);
          }
        } catch (error) {
          addTestResult(2, 'error', `❌ Erreur lors de la vérification de ${created.name}: ${error.message}`);
          verificationErrors.push(`${created.name}: ${error.message}`);
        }
      }

      // Résumé de la vérification
      if (foundCount === createdItems.length && verificationErrors.length === 0) {
        addTestResult(2, 'success', `🎉 Tous les ingrédients (${foundCount}/${createdItems.length}) sauvegardés et vérifiés avec succès!`);
      } else if (foundCount === createdItems.length) {
        addTestResult(2, 'warning', `⚠️ Tous les ingrédients trouvés mais avec des avertissements: ${verificationErrors.length} problèmes`);
      } else {
        addTestResult(2, 'error', `❌ Vérification échouée: ${foundCount}/${createdItems.length} trouvés, ${verificationErrors.length} erreurs`);
        if (verificationErrors.length > 0) {
          throw new Error(`Erreurs de vérification: ${verificationErrors.join('; ')}`);
        }
      }

      setActiveStep(3);

      // Étape 4: Test de recherche
      addTestResult(3, 'running', 'Test de la fonctionnalité de recherche...');

      for (const created of createdItems) {
        try {
          const searchResults = await searchIngredients(created.name);
          const found = searchResults.find(result => result.id === created.id);

          if (found) {
            addTestResult(3, 'success', `Recherche réussie pour: ${created.name}`);
          } else {
            addTestResult(3, 'warning', `Recherche échouée pour: ${created.name}`);
          }
        } catch (error) {
          addTestResult(3, 'error', `Erreur de recherche pour ${created.name}: ${error.message}`);
        }
      }

      setActiveStep(4);

      // Étape 5: Validation finale des données
      addTestResult(4, 'running', 'Validation finale des données...');

      const stats = {
        totalIngredients: ingredients.length,
        publicIngredients: publicIngredients.length,
        familyIngredients: familyIngredients.length,
        createdInTest: createdItems.length
      };

      addTestResult(4, 'success', `Statistiques finales: ${JSON.stringify(stats)}`);
      addTestResult(4, 'success', 'Test complet terminé avec succès!');

      setActiveStep(5);

    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestError(error.message);
      addTestResult(activeStep, 'error', `Test échoué: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;

    try {
      const results = await searchIngredients(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const getStepIcon = (stepIndex) => {
    const stepResult = testResults.find(r => r.step === stepIndex && r.status !== 'running');
    if (!stepResult) return stepIndex + 1;

    switch (stepResult.status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'running':
        return <CircularProgress size={24} />;
      default:
        return stepIndex + 1;
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🧪 Test de Sauvegarde des Ingrédients
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Test complet de la fonctionnalité de création et sauvegarde d'ingrédients avec vérification de la structure de données.
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
            <Typography><strong>Ingrédients totaux:</strong> {ingredients.length}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Statut:</strong> {loading ? 'Chargement...' : 'Prêt'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Erreurs */}
      {(error || testError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || testError}
        </Alert>
      )}

      {/* Contrôles de test */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ Contrôles de Test
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <Button
            variant="contained"
            startIcon={isTesting ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={runComprehensiveTest}
            disabled={isTesting || !currentUser || !family?.id}
            color="primary"
          >
            {isTesting ? 'Test en cours...' : 'Démarrer Test Complet'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            disabled={isTesting}
          >
            Actualiser Page
          </Button>
        </Box>

        {/* Test de recherche manuel */}
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Test de recherche"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            placeholder="Tapez un nom d'ingrédient..."
          />
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={handleSearch}
            disabled={!searchTerm}
          >
            Rechercher
          </Button>
        </Box>

        {searchResults.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2">Résultats de recherche ({searchResults.length}):</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              {searchResults.map((result) => (
                <Chip
                  key={result.id}
                  label={result.name}
                  icon={result.isPublic ? <Public /> : <Lock />}
                  color={result.source === 'family' ? 'primary' : 'default'}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Progression du test */}
      {(isTesting || testResults.length > 0) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📈 Progression du Test
          </Typography>

          <Stepper activeStep={activeStep} orientation="vertical">
            {TEST_STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel icon={getStepIcon(index)}>
                  {label}
                </StepLabel>
                <StepContent>
                  <Box>
                    {testResults
                      .filter(result => result.step === index)
                      .map((result, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          color={result.status === 'error' ? 'error' : 'text.secondary'}
                          sx={{ mb: 0.5 }}
                        >
                          [{result.timestamp}] {result.message}
                        </Typography>
                      ))
                    }
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Ingrédients créés */}
      {createdIngredients.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            ✅ Ingrédients Créés dans ce Test
          </Typography>

          <List>
            {createdIngredients.map((ingredient) => (
              <ListItem key={ingredient.id}>
                <ListItemIcon>
                  {ingredient.isPublic ? <Public color="info" /> : <Lock color="primary" />}
                </ListItemIcon>
                <ListItemText
                  primary={ingredient.name}
                  secondary={`${ingredient.price} FCFA/${ingredient.unit} - ${ingredient.category} - ID: ${ingredient.id}`}
                />
                <Chip
                  label={ingredient.isPublic ? 'Public' : 'Famille'}
                  color={ingredient.isPublic ? 'info' : 'primary'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default IngredientSaveTest;
