/**
 * 🌱 Composant de Test pour le Seeder Firestore MiamBidi
 * Interface utilisateur pour exécuter et monitorer le seeding de la base de données
 */

import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Error,
  Restaurant,
  Inventory,
  Group,
  Visibility,
  PlayArrow,
  Stop,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import {
  runCompleteSeeding,
  clearExistingData,
  verifyCollections,
  EXISTING_FAMILY_IDS,
  SAMPLE_INGREDIENTS,
  SAMPLE_PANTRY_ITEMS
} from '../../utils/firestoreSeeder';

const SEEDING_STEPS = [
  'Vérification des prérequis',
  'Nettoyage optionnel des données',
  'Création des ingrédients',
  'Peuplement du garde-manger',
  'Vérification finale'
];

function FirestoreSeederTest() {
  const { currentUser } = useAuth();
  const { family } = useFamily();
  
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [seedingResults, setSeedingResults] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);
  const [error, setError] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [stepResults, setStepResults] = useState({});

  const handleRunSeeding = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedingResults(null);
    setActiveStep(0);
    setStepResults({});

    try {
      // Simuler les étapes du seeding
      setStepResults({ 0: { status: 'running', message: 'Vérification en cours...' } });
      
      const results = await runCompleteSeeding({ 
        clearExisting,
        skipVerification: false 
      });
      
      if (results.success) {
        setSeedingResults(results);
        setActiveStep(SEEDING_STEPS.length);
        setStepResults({
          0: { status: 'completed', message: 'Prérequis vérifiés' },
          1: { status: 'completed', message: clearExisting ? 'Données nettoyées' : 'Nettoyage ignoré' },
          2: { status: 'completed', message: `${results.ingredientsCreated} ingrédients créés` },
          3: { status: 'completed', message: `Garde-manger peuplé pour ${results.familiesProcessed} familles` },
          4: { status: 'completed', message: 'Vérification terminée avec succès' }
        });
      } else {
        throw new Error(results.error);
      }
    } catch (error) {
      console.error('Erreur de seeding:', error);
      setError(`Échec du seeding: ${error.message}`);
      setStepResults(prev => ({
        ...prev,
        [activeStep]: { status: 'error', message: error.message }
      }));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les données existantes ?')) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      await clearExistingData();
      setSeedingResults(null);
      setVerificationResults(null);
      console.log('✅ Données supprimées avec succès');
    } catch (error) {
      console.error('Erreur de suppression:', error);
      setError(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleVerifyCollections = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const results = await verifyCollections();
      setVerificationResults(results);
    } catch (error) {
      console.error('Erreur de vérification:', error);
      setError(`Erreur lors de la vérification: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStepIcon = (stepIndex) => {
    const stepResult = stepResults[stepIndex];
    if (!stepResult) return stepIndex + 1;
    
    switch (stepResult.status) {
      case 'completed':
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
        🌱 Seeder Firestore MiamBidi
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Outil de peuplement de la base de données avec des ingrédients et données de garde-manger réalistes.
      </Typography>

      {/* État actuel */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 État Actuel
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography><strong>Utilisateur:</strong> {currentUser ? currentUser.email : 'Non connecté'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography><strong>Famille:</strong> {family ? family.name : 'Aucune famille'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography><strong>Familles cibles:</strong> {EXISTING_FAMILY_IDS.length}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Données à créer */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Restaurant color="primary" />
                <Typography variant="h6">Ingrédients</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {SAMPLE_INGREDIENTS.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingrédients camerounais authentiques
              </Typography>
              <Box mt={1}>
                <Chip label="Ndolé" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Huile de palme" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Plantains" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Inventory color="secondary" />
                <Typography variant="h6">Garde-manger</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {SAMPLE_PANTRY_ITEMS.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Éléments par famille
              </Typography>
              <Box mt={1}>
                <Chip label="Réfrigérateur" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Garde-manger" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Group color="info" />
                <Typography variant="h6">Familles</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {EXISTING_FAMILY_IDS.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Familles existantes ciblées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contrôles */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ Contrôles de Seeding
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              disabled={isSeeding}
            />
          }
          label="Nettoyer les données existantes avant le seeding"
          sx={{ mb: 2 }}
        />

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={isSeeding ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={handleRunSeeding}
            disabled={isSeeding || isClearing}
            color="primary"
          >
            {isSeeding ? 'Seeding en cours...' : 'Démarrer le Seeding'}
          </Button>

          <Button
            variant="outlined"
            startIcon={isVerifying ? <CircularProgress size={20} /> : <Visibility />}
            onClick={handleVerifyCollections}
            disabled={isSeeding || isClearing || isVerifying}
          >
            {isVerifying ? 'Vérification...' : 'Vérifier Collections'}
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={isClearing ? <CircularProgress size={20} /> : <Delete />}
            onClick={handleClearData}
            disabled={isSeeding || isClearing}
          >
            {isClearing ? 'Suppression...' : 'Nettoyer Données'}
          </Button>
        </Box>
      </Paper>

      {/* Erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progression du seeding */}
      {(isSeeding || Object.keys(stepResults).length > 0) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📈 Progression du Seeding
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {SEEDING_STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel icon={getStepIcon(index)}>
                  {label}
                </StepLabel>
                <StepContent>
                  {stepResults[index] && (
                    <Typography variant="body2" color="text.secondary">
                      {stepResults[index].message}
                    </Typography>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Résultats de vérification */}
      {verificationResults && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔍 État des Collections
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {verificationResults.families}
                </Typography>
                <Typography variant="body2">Familles</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="secondary">
                  {verificationResults.ingredients}
                </Typography>
                <Typography variant="body2">Ingrédients</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {verificationResults.pantry}
                </Typography>
                <Typography variant="body2">Garde-manger</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Résultats du seeding */}
      {seedingResults && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎉 Résultats du Seeding
          </Typography>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            Seeding terminé avec succès !
          </Alert>

          <List>
            <ListItem>
              <ListItemIcon>
                <Restaurant color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Ingrédients créés"
                secondary={`${seedingResults.ingredientsCreated} ingrédients ajoutés à la base de données`}
              />
              <Chip label={seedingResults.ingredientsCreated} color="primary" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Group color="info" />
              </ListItemIcon>
              <ListItemText 
                primary="Familles traitées"
                secondary={`Garde-manger peuplé pour ${seedingResults.familiesProcessed} familles`}
              />
              <Chip label={seedingResults.familiesProcessed} color="info" />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Inventory color="secondary" />
              </ListItemIcon>
              <ListItemText 
                primary="Éléments de garde-manger"
                secondary={`${seedingResults.stats?.pantry || 0} éléments créés au total`}
              />
              <Chip label={seedingResults.stats?.pantry || 0} color="secondary" />
            </ListItem>
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default FirestoreSeederTest;
