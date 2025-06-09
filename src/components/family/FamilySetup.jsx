import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { FamilyRestroom, Add, Group } from '@mui/icons-material';
import { useFamily } from '../../contexts/FirestoreFamilyContext';

const steps = ['Choisir une Option', 'Détails de la Famille'];

function FamilySetup() {
  const [activeStep, setActiveStep] = useState(0);
  const [setupType, setSetupType] = useState(''); // 'create' or 'join'
  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createFamily, joinFamily } = useFamily();

  function handleSetupTypeSelect(type) {
    setSetupType(type);
    setActiveStep(1);
    setError('');
  }

  async function handleCreateFamily(e) {
    e.preventDefault();

    if (!familyName.trim()) {
      setError('Veuillez entrer un nom de famille');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await createFamily(familyName.trim());
    } catch (error) {
      console.error('Create family error:', error);
      setError('Échec de la création de la famille. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinFamily(e) {
    e.preventDefault();

    if (!familyId.trim()) {
      setError('Veuillez entrer un ID de famille');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await joinFamily(familyId.trim());
    } catch (error) {
      console.error('Join family error:', error);
      if (error.message.includes('n\'existe pas')) {
        setError('Famille non trouvée. Veuillez vérifier l\'ID de famille');
      } else {
        setError('Échec de l\'adhésion à la famille. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setActiveStep(0);
    setSetupType('');
    setError('');
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="grey.50"
      p={2}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Configuration Famille
          </Typography>
          <Typography variant="body1" gutterBottom align="center" color="text.secondary" sx={{ mb: 3 }}>
            Commençons la planification des repas de votre famille !
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom align="center">
                Comment souhaitez-vous commencer ?
              </Typography>

              <Box display="flex" flexDirection="column" gap={2} mt={3}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => handleSetupTypeSelect('create')}
                  sx={{ p: 2, justifyContent: 'flex-start' }}
                >
                  <Box textAlign="left" ml={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Créer une Nouvelle Famille
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Commencez avec un nouveau groupe de planification familiale
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Group />}
                  onClick={() => handleSetupTypeSelect('join')}
                  sx={{ p: 2, justifyContent: 'flex-start' }}
                >
                  <Box textAlign="left" ml={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Rejoindre une Famille Existante
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejoignez une famille qui a déjà été créée
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && setupType === 'create' && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <FamilyRestroom color="primary" sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6">Créer Votre Famille</Typography>
              </Box>

              <Box component="form" onSubmit={handleCreateFamily}>
                <TextField
                  fullWidth
                  label="Nom de la Famille"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  placeholder="ex: Famille Takam"
                  helperText="Ce nom sera visible par tous les membres de la famille"
                />

                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Créer la Famille'}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {activeStep === 1 && setupType === 'join' && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <Group color="primary" sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6">Rejoindre une Famille</Typography>
              </Box>

              <Box component="form" onSubmit={handleJoinFamily}>
                <TextField
                  fullWidth
                  label="ID de la Famille"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  placeholder="Entrez l'ID de famille fourni par votre administrateur"
                  helperText="Demandez l'ID de famille à votre administrateur"
                />

                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Rejoindre la Famille'}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default FamilySetup;
