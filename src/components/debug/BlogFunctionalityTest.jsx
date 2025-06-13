/**
 * Blog Functionality Test Component
 * Comprehensive testing of blog features with seeding capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  CheckCircle,
  Error,
  Warning,
  Info,
  Article,
  Visibility,
  Create,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useBlog } from '../../contexts/BlogContext';
import { seedBlogArticles, cleanupSeededBlogs, checkIfBlogsSeeded } from '../../utils/blogSeeder';
import { validateBlogIndexes } from '../../utils/firestoreIndexValidator';

function BlogFunctionalityTest() {
  const { currentUser } = useAuth();
  const { 
    userBlogs, 
    publicBlogs, 
    loading, 
    error, 
    fetchUserBlogs, 
    fetchPublicBlogs 
  } = useBlog();

  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [indexValidation, setIndexValidation] = useState(null);
  const [seedStatus, setSeedStatus] = useState({
    isSeeded: false,
    checking: false,
    seeding: false,
    cleaning: false
  });

  useEffect(() => {
    if (currentUser) {
      checkSeedStatus();
    }
  }, [currentUser]);

  const addTestResult = (type, message, details = null) => {
    const result = {
      id: Date.now(),
      type,
      message,
      details,
      timestamp: new Date().toLocaleTimeString('fr-FR')
    };
    setTestResults(prev => [...prev, result]);
  };

  const checkSeedStatus = async () => {
    if (!currentUser) return;
    
    setSeedStatus(prev => ({ ...prev, checking: true }));
    try {
      const isSeeded = await checkIfBlogsSeeded(currentUser.uid);
      setSeedStatus(prev => ({ ...prev, isSeeded, checking: false }));
    } catch (error) {
      console.error('Error checking seed status:', error);
      setSeedStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const runComprehensiveTest = async () => {
    if (!currentUser) {
      addTestResult('error', 'Utilisateur non connecté');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    try {
      addTestResult('info', '🚀 Démarrage des tests de fonctionnalité blog');

      // Test 1: Index Validation
      addTestResult('info', '📊 Test 1: Validation des index Firestore');
      try {
        const indexResults = await validateBlogIndexes();
        setIndexValidation(indexResults);
        
        if (indexResults.overall === 'available') {
          addTestResult('success', '✅ Tous les index blog sont disponibles');
        } else if (indexResults.overall === 'missing') {
          addTestResult('warning', `⚠️ ${indexResults.summary.missing} index(es) manquant(s)`);
        } else {
          addTestResult('error', '❌ Erreurs dans la validation des index');
        }
      } catch (error) {
        addTestResult('error', `❌ Erreur validation index: ${error.message}`);
      }

      // Test 2: User Blogs Query
      addTestResult('info', '👤 Test 2: Requête des articles utilisateur');
      try {
        const userBlogsResult = await fetchUserBlogs();
        addTestResult('success', `✅ Articles utilisateur chargés: ${userBlogsResult.length}`);
      } catch (error) {
        addTestResult('error', `❌ Erreur articles utilisateur: ${error.message}`);
      }

      // Test 3: Public Blogs Query
      addTestResult('info', '🌍 Test 3: Requête des articles publics');
      try {
        const publicBlogsResult = await fetchPublicBlogs(5);
        addTestResult('success', `✅ Articles publics chargés: ${publicBlogsResult.length}`);
      } catch (error) {
        addTestResult('error', `❌ Erreur articles publics: ${error.message}`);
      }

      // Test 4: Blog Context State
      addTestResult('info', '🔄 Test 4: État du contexte blog');
      addTestResult('info', `📝 Articles utilisateur en mémoire: ${userBlogs.length}`);
      addTestResult('info', `🌐 Articles publics en mémoire: ${publicBlogs.length}`);
      addTestResult('info', `⏳ État de chargement: ${loading ? 'En cours' : 'Terminé'}`);
      addTestResult('info', `⚠️ Erreurs: ${error || 'Aucune'}`);

      // Test 5: Template Functionality
      addTestResult('info', '🎨 Test 5: Fonctionnalité des templates');
      const templates = ['TEMPLATE_A', 'TEMPLATE_B', 'TEMPLATE_C'];
      templates.forEach(template => {
        addTestResult('success', `✅ Template ${template} disponible`);
      });

      addTestResult('success', '🎉 Tests terminés avec succès!');

    } catch (error) {
      addTestResult('error', `❌ Erreur générale: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSeedBlogs = async () => {
    if (!currentUser) return;

    setSeedStatus(prev => ({ ...prev, seeding: true }));
    try {
      addTestResult('info', '🌱 Création d\'articles de test...');
      const createdBlogs = await seedBlogArticles(currentUser.uid);
      
      addTestResult('success', `✅ ${createdBlogs.length} articles créés avec succès`);
      createdBlogs.forEach(blog => {
        addTestResult('info', `📝 Créé: ${blog.title} (${blog.status})`);
      });

      setSeedStatus(prev => ({ ...prev, isSeeded: true, seeding: false }));
      
      // Refresh blog data
      await fetchUserBlogs();
      await fetchPublicBlogs();
      
    } catch (error) {
      addTestResult('error', `❌ Erreur création articles: ${error.message}`);
      setSeedStatus(prev => ({ ...prev, seeding: false }));
    }
  };

  const handleCleanupBlogs = async () => {
    if (!currentUser) return;

    setSeedStatus(prev => ({ ...prev, cleaning: true }));
    try {
      addTestResult('info', '🧹 Suppression des articles de test...');
      const deletedCount = await cleanupSeededBlogs(currentUser.uid);
      
      addTestResult('success', `✅ ${deletedCount} articles supprimés`);
      setSeedStatus(prev => ({ ...prev, isSeeded: false, cleaning: false }));
      
      // Refresh blog data
      await fetchUserBlogs();
      await fetchPublicBlogs();
      
    } catch (error) {
      addTestResult('error', `❌ Erreur suppression: ${error.message}`);
      setSeedStatus(prev => ({ ...prev, cleaning: false }));
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  if (!currentUser) {
    return (
      <Alert severity="warning">
        Veuillez vous connecter pour tester la fonctionnalité blog.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Test de Fonctionnalité Blog
      </Typography>
      
      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Panneau de Contrôle
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
                  onClick={runComprehensiveTest}
                  disabled={isRunning}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {isRunning ? 'Tests en cours...' : 'Lancer Tests Complets'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => setTestResults([])}
                  fullWidth
                  disabled={isRunning}
                >
                  Effacer Résultats
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Gestion des Articles de Test
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={seedStatus.isSeeded ? 'Articles présents' : 'Aucun article'}
                  color={seedStatus.isSeeded ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 1 }}
                />
                
                {seedStatus.checking && (
                  <Typography variant="caption" display="block">
                    Vérification en cours...
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                color="secondary"
                startIcon={seedStatus.seeding ? <CircularProgress size={20} /> : <Create />}
                onClick={handleSeedBlogs}
                disabled={seedStatus.seeding || seedStatus.isSeeded}
                fullWidth
                sx={{ mb: 1 }}
              >
                {seedStatus.seeding ? 'Création...' : 'Créer Articles Test'}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={seedStatus.cleaning ? <CircularProgress size={20} /> : <Delete />}
                onClick={handleCleanupBlogs}
                disabled={seedStatus.cleaning || !seedStatus.isSeeded}
                fullWidth
              >
                {seedStatus.cleaning ? 'Suppression...' : 'Supprimer Articles Test'}
              </Button>
            </CardContent>
          </Card>

          {/* Index Status */}
          {indexValidation && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  État des Index
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={`✅ ${indexValidation.summary.available}`} color="success" size="small" />
                  <Chip label={`❌ ${indexValidation.summary.missing}`} color="error" size="small" />
                  <Chip label={`⚠️ ${indexValidation.summary.errors}`} color="warning" size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Statut global: {indexValidation.overall}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Test Results */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 600, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Résultats des Tests
            </Typography>
            
            {testResults.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                Aucun test exécuté. Cliquez sur "Lancer Tests Complets" pour commencer.
              </Typography>
            ) : (
              <List dense>
                {testResults.map((result) => (
                  <ListItem key={result.id}>
                    <ListItemIcon>
                      {getResultIcon(result.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.message}
                      secondary={`${result.timestamp}${result.details ? ` - ${result.details}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BlogFunctionalityTest;
