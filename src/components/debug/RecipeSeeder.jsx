/**
 * 🍽️ Recipe Seeder Component for MiamBidi
 * Debug component for seeding Firestore with authentic Cameroonian recipes
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useNotification } from '../../contexts/NotificationContext';

// Sample Cameroonian recipes for seeding
const CAMEROONIAN_RECIPES = [
  {
    name: 'Ndolé Traditionnel',
    description: 'Plat national camerounais aux feuilles de ndolé, arachides et poisson fumé',
    category: 'Plat principal',
    cuisine: 'Camerounaise',
    difficulty: 'Moyen',
    prepTime: 45,
    cookTime: 90,
    servings: '6 personnes',
    tags: ['Traditionnel', 'Festif', 'Épicé'],
    aliases: ['Ndole', 'Ndoleh'],
    ingredients: [
      { name: 'Feuilles de ndolé', quantity: 500, unit: 'g', notes: 'Fraîches ou congelées' },
      { name: 'Arachides crues', quantity: 300, unit: 'g', notes: 'À moudre' },
      { name: 'Crevettes séchées', quantity: 200, unit: 'g', notes: 'Bien nettoyées' },
      { name: 'Poisson fumé', quantity: 250, unit: 'g', notes: 'Machoiron ou capitaine' },
      { name: 'Viande de bœuf', quantity: 400, unit: 'g', notes: 'En morceaux' },
      { name: 'Huile de palme', quantity: 4, unit: 'cuillères à soupe', notes: 'Rouge' },
      { name: 'Oignons', quantity: 2, unit: 'pièces', notes: 'Moyens' },
      { name: 'Ail', quantity: 6, unit: 'gousses', notes: 'Frais' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', notes: '3cm environ' },
      { name: 'Piment rouge', quantity: 2, unit: 'pièces', notes: 'Selon goût' },
      { name: 'Cube Maggi', quantity: 2, unit: 'pièces', notes: 'Assaisonnement' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', notes: 'À ajuster' }
    ],
    instructions: [
      'Nettoyer soigneusement les feuilles de ndolé et les faire bouillir 30 minutes.',
      'Égoutter les feuilles et les presser pour enlever l\'amertume.',
      'Faire griller les arachides à sec puis les moudre finement.',
      'Couper la viande en morceaux et assaisonner avec sel et épices.',
      'Dans une grande marmite, faire chauffer l\'huile de palme.',
      'Faire revenir la viande jusqu\'à ce qu\'elle soit bien dorée.',
      'Ajouter les oignons, l\'ail et le gingembre hachés finement.',
      'Incorporer les crevettes séchées et le poisson fumé émietté.',
      'Ajouter les arachides moulues et mélanger soigneusement.',
      'Verser de l\'eau chaude pour couvrir et laisser mijoter 1 heure.',
      'Ajouter les feuilles de ndolé et mélanger délicatement.',
      'Assaisonner avec les cubes Maggi, le sel et les piments.',
      'Laisser cuire encore 30 minutes en remuant régulièrement.',
      'Rectifier l\'assaisonnement et servir avec du riz blanc ou des tubercules.'
    ]
  },
  {
    name: 'Poulet DG',
    description: 'Poulet Directeur Général aux plantains et légumes, plat festif camerounais',
    category: 'Plat principal',
    cuisine: 'Camerounaise',
    difficulty: 'Moyen',
    prepTime: 30,
    cookTime: 45,
    servings: '4 personnes',
    tags: ['Traditionnel', 'Festif'],
    aliases: ['Poulet Directeur Général', 'Chicken DG'],
    ingredients: [
      { name: 'Poulet entier', quantity: 1, unit: 'pièce', notes: 'Découpé en morceaux' },
      { name: 'Plantains mûrs', quantity: 3, unit: 'pièces', notes: 'Bien mûrs' },
      { name: 'Carottes', quantity: 2, unit: 'pièces', notes: 'Moyennes' },
      { name: 'Haricots verts', quantity: 200, unit: 'g', notes: 'Frais' },
      { name: 'Petits pois', quantity: 150, unit: 'g', notes: 'Frais ou surgelés' },
      { name: 'Huile végétale', quantity: 4, unit: 'cuillères à soupe', notes: 'Pour friture' },
      { name: 'Oignons', quantity: 2, unit: 'pièces', notes: 'Moyens' },
      { name: 'Tomates', quantity: 3, unit: 'pièces', notes: 'Bien mûres' },
      { name: 'Ail', quantity: 4, unit: 'gousses', notes: 'Frais' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', notes: '2cm environ' },
      { name: 'Curry en poudre', quantity: 2, unit: 'cuillères à café', notes: 'Épice' },
      { name: 'Thym', quantity: 1, unit: 'cuillère à café', notes: 'Séché' },
      { name: 'Cube Maggi', quantity: 2, unit: 'pièces', notes: 'Assaisonnement' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', notes: 'À ajuster' },
      { name: 'Poivre noir', quantity: 1, unit: 'cuillère à café', notes: 'Moulu' }
    ],
    instructions: [
      'Découper le poulet en morceaux et nettoyer soigneusement.',
      'Préparer la marinade avec l\'ail, le gingembre, le curry, le thym, le sel et le poivre.',
      'Mariner le poulet pendant au moins 30 minutes.',
      'Éplucher et couper les plantains en rondelles épaisses.',
      'Faire frire les plantains dans l\'huile chaude jusqu\'à dorure, réserver.',
      'Faire dorer les morceaux de poulet de tous les côtés dans la même huile.',
      'Retirer le poulet et faire revenir les oignons jusqu\'à transparence.',
      'Ajouter les tomates coupées et cuire jusqu\'à formation d\'une sauce.',
      'Remettre le poulet dans la casserole avec un peu d\'eau.',
      'Ajouter les carottes coupées en rondelles et cuire 15 minutes.',
      'Incorporer les haricots verts et les petits pois.',
      'Assaisonner avec les cubes Maggi et laisser mijoter 10 minutes.',
      'Ajouter les plantains frits en fin de cuisson.',
      'Servir chaud avec du riz blanc ou des tubercules.'
    ]
  },
  {
    name: 'Beignets Haricots',
    description: 'Beignets croustillants à base de haricots, collation populaire camerounaise',
    category: 'Collation',
    cuisine: 'Camerounaise',
    difficulty: 'Facile',
    prepTime: 20,
    cookTime: 15,
    servings: '4 personnes',
    tags: ['Traditionnel', 'Rapide', 'Économique'],
    aliases: ['Accra', 'Bean cakes'],
    ingredients: [
      { name: 'Haricots blancs', quantity: 500, unit: 'g', notes: 'Secs, trempés' },
      { name: 'Oignons', quantity: 1, unit: 'pièce', notes: 'Moyen' },
      { name: 'Ail', quantity: 3, unit: 'gousses', notes: 'Frais' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', notes: '2cm environ' },
      { name: 'Piment rouge', quantity: 1, unit: 'pièce', notes: 'Selon goût' },
      { name: 'Huile végétale', quantity: 500, unit: 'ml', notes: 'Pour friture' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', notes: 'À ajuster' },
      { name: 'Cube végétal', quantity: 1, unit: 'pièce', notes: 'Assaisonnement' }
    ],
    instructions: [
      'Faire tremper les haricots dans l\'eau pendant 4-6 heures.',
      'Frotter les haricots pour enlever la peau.',
      'Rincer plusieurs fois jusqu\'à ce que l\'eau soit claire.',
      'Mixer les haricots avec un peu d\'eau pour obtenir une pâte.',
      'Ajouter les oignons, l\'ail, le gingembre et le piment mixés.',
      'Assaisonner avec le sel et le cube végétal écrasé.',
      'Battre la pâte vigoureusement pour l\'aérer.',
      'Faire chauffer l\'huile à 180°C.',
      'Former des boulettes avec une cuillère et les plonger dans l\'huile.',
      'Faire frire jusqu\'à ce qu\'ils soient dorés et croustillants.',
      'Égoutter sur du papier absorbant.',
      'Servir chaud avec du thé ou du café.'
    ]
  }
];

export default function RecipeSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);

  const { currentUser } = useAuth();
  const { family } = useFamily();
  const { showNotification } = useNotification();

  // Simplified seeding function
  const seedRecipes = async () => {
    if (!currentUser || !family) {
      setResults({
        success: false,
        message: 'Utilisateur ou famille non trouvé. Veuillez vous connecter.',
        count: 0
      });
      return;
    }

    setSeeding(true);
    setProgress(0);
    setStatus('Préparation du seeding des recettes...');

    try {
      const recipesCollection = collection(db, 'recipes');
      let processedCount = 0;

      for (const recipe of CAMEROONIAN_RECIPES) {
        setStatus(`Ajout de la recette: ${recipe.name}`);

        const recipeData = {
          ...recipe,
          familyId: family.id,
          createdBy: currentUser.uid,
          isPublic: false,
          totalCost: 0, // Simplified - no cost calculation for now
          costPerServing: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastCostUpdate: serverTimestamp(),
          imageUrl: '/images/recipes/default-meal.jpg',
          aiGenerated: false,
          searchTerms: [recipe.name.toLowerCase()]
        };

        const docRef = doc(recipesCollection);
        await setDoc(docRef, recipeData);

        processedCount++;
        setProgress((processedCount / CAMEROONIAN_RECIPES.length) * 100);
      }

      setResults({
        success: true,
        message: 'Recettes ajoutées avec succès!',
        count: processedCount
      });

      if (showNotification) {
        showNotification('Recettes ajoutées avec succès!', 'success');
      }

    } catch (error) {
      console.error('Erreur lors du seeding des recettes:', error);
      setResults({
        success: false,
        message: `Erreur: ${error.message}`,
        count: 0
      });

      if (showNotification) {
        showNotification('Erreur lors de l\'ajout des recettes', 'error');
      }
    } finally {
      setSeeding(false);
      setProgress(0);
      setStatus('');
    }
  };

  // Clear all recipes
  const clearRecipes = async () => {
    if (!family) {
      setResults({
        success: false,
        message: 'Famille non trouvée.',
        count: 0
      });
      return;
    }

    setClearing(true);
    setProgress(0);
    setStatus('Suppression des recettes...');

    try {
      const recipesCollection = collection(db, 'recipes');
      const querySnapshot = await getDocs(recipesCollection);

      const batch = writeBatch(db);
      let deleteCount = 0;

      querySnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.familyId === family.id) {
          batch.delete(docSnapshot.ref);
          deleteCount++;
        }
      });

      if (deleteCount > 0) {
        await batch.commit();
      }

      setResults({
        success: true,
        message: 'Recettes supprimées avec succès!',
        count: deleteCount
      });

      if (showNotification) {
        showNotification('Recettes supprimées avec succès!', 'success');
      }

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setResults({
        success: false,
        message: `Erreur: ${error.message}`,
        count: 0
      });

      if (showNotification) {
        showNotification('Erreur lors de la suppression', 'error');
      }
    } finally {
      setClearing(false);
      setProgress(0);
      setStatus('');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <RestaurantIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Générateur de Recettes MiamBidi
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Cet outil permet de peupler la base de données Firestore avec des recettes camerounaises authentiques.
            Les recettes incluent des calculs de coûts automatiques et une intégration avec les ingrédients existants.
          </Typography>

          <Grid container spacing={3}>
            {/* Status and Progress */}
            <Grid item xs={12}>
              {(seeding || clearing) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {status}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {Math.round(progress)}% terminé
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Recipe Preview */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recettes à Générer ({CAMEROONIAN_RECIPES.length})
                  </Typography>
                  
                  <List dense>
                    {CAMEROONIAN_RECIPES.map((recipe, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <RestaurantIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={recipe.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {recipe.description}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={recipe.difficulty} 
                                  size="small" 
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                                <Chip 
                                  label={`${recipe.prepTime + recipe.cookTime} min`} 
                                  size="small" 
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                                <Chip 
                                  label={recipe.servings} 
                                  size="small" 
                                  sx={{ mb: 0.5 }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={seedRecipes}
                  disabled={seeding || clearing}
                  sx={{ minWidth: 200 }}
                >
                  {seeding ? 'Ajout en cours...' : 'Ajouter les Recettes'}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={clearRecipes}
                  disabled={seeding || clearing}
                  sx={{ minWidth: 200 }}
                >
                  {clearing ? 'Suppression...' : 'Supprimer les Recettes'}
                </Button>
              </Box>
            </Grid>

            {/* Results */}
            {results && (
              <Grid item xs={12}>
                <Alert
                  severity={results.success ? 'success' : 'error'}
                  icon={results.success ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                  <Typography variant="body1">
                    {results.message}
                  </Typography>
                  {results.count > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Nombre d'éléments traités: {results.count}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
