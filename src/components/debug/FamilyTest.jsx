/**
 * Family Test Component for MiamBidi
 * Tests Firestore family functionality
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Info,
  Group,
  Person,
  Add,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useAuth } from '../../contexts/AuthContext';
import { createSampleFamilyData } from '../../utils/familyDataMigration';
import { FamilyTestSuite } from '../../utils/familyTestSuite';
import { runManualTestChecklist } from '../../utils/recipesPageTest';
import { runCalendarFixTestChecklist } from '../../utils/calendarPageFixTest';
import { runShoppingListEmailTestChecklist } from '../../utils/shoppingListEmailTest';

function FamilyTest() {
  const {
    family,
    familyMembers,
    loading,
    error,
    createFamily,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateFamilyName,
    leaveFamily
  } = useFamily();

  const { currentUser } = useAuth();

  const [testResults, setTestResults] = useState([]);
  const [isTestingFamily, setIsTestingFamily] = useState(false);
  const [testSuite, setTestSuite] = useState(null);
  const [comprehensiveResults, setComprehensiveResults] = useState(null);
  const [testFamilyName, setTestFamilyName] = useState('Test Family');
  const [testMemberData, setTestMemberData] = useState({
    displayName: 'Test Member',
    email: 'test.member@example.com',
    age: 25
  });

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
    setComprehensiveResults(null);
  };

  // Initialize test suite
  React.useEffect(() => {
    if (currentUser) {
      const suite = new FamilyTestSuite(
        { family, familyMembers, createFamily, addFamilyMember, updateFamilySettings },
        { currentUser }
      );
      setTestSuite(suite);
    }
  }, [currentUser, family, familyMembers, createFamily, addFamilyMember, updateFamilySettings]);

  const runComprehensiveTests = async () => {
    if (!testSuite) {
      addTestResult('❌ Test suite not initialized', 'error');
      return;
    }

    setIsTestingFamily(true);
    addTestResult('🧪 Starting comprehensive test suite...', 'info');

    try {
      const results = await testSuite.runAllTests();
      setComprehensiveResults(results);

      addTestResult(
        `✅ Comprehensive tests completed: ${results.summary.passed}/${results.summary.total} passed (${results.summary.passRate.toFixed(1)}%)`,
        results.summary.passRate === 100 ? 'success' : 'warning'
      );
    } catch (error) {
      addTestResult(`❌ Comprehensive tests failed: ${error.message}`, 'error');
    } finally {
      setIsTestingFamily(false);
    }
  };

  const cleanupTestData = async () => {
    if (!testSuite) {
      addTestResult('❌ Test suite not initialized', 'error');
      return;
    }

    try {
      await testSuite.cleanupTestData();
      addTestResult('✅ Test data cleaned up successfully', 'success');
    } catch (error) {
      addTestResult(`❌ Cleanup failed: ${error.message}`, 'error');
    }
  };

  const testRecipesPage = () => {
    addTestResult('🧪 Running recipes page manual test checklist...', 'info');
    runManualTestChecklist();
    addTestResult('✅ Recipes page test checklist logged to console. Check browser console for details.', 'success');

    // Open recipes page in new tab for testing
    window.open('/recipes', '_blank');
  };

  const testCalendarPageFix = () => {
    addTestResult('🧪 Running calendar page fix test checklist...', 'info');
    runCalendarFixTestChecklist();
    addTestResult('✅ Calendar page fix test checklist logged to console. Check browser console for details.', 'success');

    // Open calendar page in new tab for testing
    window.open('/calendar', '_blank');
  };

  const testShoppingListEmail = () => {
    addTestResult('📧 Running shopping list email functionality test checklist...', 'info');
    runShoppingListEmailTestChecklist();
    addTestResult('✅ Shopping list email test checklist logged to console. Check browser console for details.', 'success');

    // Open shopping list page in new tab for testing
    window.open('/shopping-list', '_blank');
  };

  const testCreateFamily = async () => {
    setIsTestingFamily(true);
    addTestResult('🧪 Testing family creation...', 'info');

    try {
      await createFamily(testFamilyName);
      addTestResult('✅ Family creation successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Family creation failed: ${error.message}`, 'error');
    } finally {
      setIsTestingFamily(false);
    }
  };

  const testAddMember = async () => {
    if (!family) {
      addTestResult('❌ No family found. Create a family first.', 'error');
      return;
    }

    addTestResult('🧪 Testing add family member...', 'info');

    try {
      await addFamilyMember(testMemberData);
      addTestResult('✅ Add member successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Add member failed: ${error.message}`, 'error');
    }
  };

  const testUpdateFamilyName = async () => {
    if (!family) {
      addTestResult('❌ No family found. Create a family first.', 'error');
      return;
    }

    addTestResult('🧪 Testing family name update...', 'info');

    try {
      const newName = `${family.name} (Updated)`;
      await updateFamilyName(newName);
      addTestResult('✅ Family name update successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Family name update failed: ${error.message}`, 'error');
    }
  };

  const testCreateSampleData = async () => {
    if (!currentUser) {
      addTestResult('❌ User not authenticated', 'error');
      return;
    }

    setIsTestingFamily(true);
    addTestResult('🧪 Creating sample family data...', 'info');

    try {
      const familyId = await createSampleFamilyData(currentUser.uid);
      addTestResult(`✅ Sample family data created: ${familyId}`, 'success');
    } catch (error) {
      addTestResult(`❌ Sample data creation failed: ${error.message}`, 'error');
    } finally {
      setIsTestingFamily(false);
    }
  };

  const testLeaveFamily = async () => {
    if (!family) {
      addTestResult('❌ No family found.', 'error');
      return;
    }

    addTestResult('🧪 Testing leave family...', 'info');

    try {
      await leaveFamily();
      addTestResult('✅ Leave family successful!', 'success');
    } catch (error) {
      addTestResult(`❌ Leave family failed: ${error.message}`, 'error');
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🏠 Family Firestore Test
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Testez les fonctionnalités de gestion de famille avec Firestore.
      </Typography>

      {/* Current Family Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            État Actuel de la Famille
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Chargement...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erreur: {error}
            </Alert>
          )}

          {family ? (
            <Box>
              <Typography variant="subtitle1">
                <strong>Famille:</strong> {family.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {family.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Membres: {familyMembers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin: {family.adminId}
              </Typography>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Aucune famille trouvée
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Test Controls */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            🧪 Suite de Tests Complète
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Exécutez tous les tests automatisés pour valider la fonctionnalité complète.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={runComprehensiveTests}
            disabled={isTestingFamily || loading || !currentUser}
            startIcon={<Refresh />}
            size="large"
          >
            {isTestingFamily ? 'Tests en cours...' : 'Exécuter Tous les Tests'}
          </Button>

          <Button
            variant="outlined"
            onClick={cleanupTestData}
            disabled={loading}
            startIcon={<Delete />}
            color="warning"
          >
            Nettoyer les Données de Test
          </Button>

          <Button
            variant="outlined"
            onClick={testRecipesPage}
            disabled={loading}
            startIcon={<Refresh />}
            color="info"
          >
            Tester Page Recettes
          </Button>

          <Button
            variant="outlined"
            onClick={testCalendarPageFix}
            disabled={loading}
            startIcon={<Refresh />}
            color="success"
          >
            Tester Calendrier (Fix)
          </Button>

          <Button
            variant="outlined"
            onClick={testShoppingListEmail}
            disabled={loading}
            startIcon={<Refresh />}
            color="secondary"
          >
            Tester Email Liste Courses
          </Button>
        </CardActions>
      </Card>

      {/* Comprehensive Test Results */}
      {comprehensiveResults && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Résultats des Tests Complets
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="body2">
                <strong>Total:</strong> {comprehensiveResults.summary.total}
              </Typography>
              <Typography variant="body2" color="success.main">
                <strong>Réussis:</strong> {comprehensiveResults.summary.passed}
              </Typography>
              <Typography variant="body2" color="error.main">
                <strong>Échoués:</strong> {comprehensiveResults.summary.failed}
              </Typography>
              <Typography variant="body2">
                <strong>Taux de réussite:</strong> {comprehensiveResults.summary.passRate.toFixed(1)}%
              </Typography>
            </Box>

            <List dense>
              {comprehensiveResults.results.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {result.success ? <CheckCircle color="success" /> : <Error color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.testName}
                    secondary={result.message}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Manual Test Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tests Manuels de Famille
              </Typography>

              <TextField
                fullWidth
                label="Nom de famille de test"
                value={testFamilyName}
                onChange={(e) => setTestFamilyName(e.target.value)}
                margin="normal"
                size="small"
              />
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={testCreateFamily}
                disabled={isTestingFamily || loading}
                startIcon={<Add />}
                size="small"
              >
                Créer Famille
              </Button>

              <Button
                variant="outlined"
                onClick={testCreateSampleData}
                disabled={isTestingFamily || loading}
                startIcon={<Group />}
                size="small"
              >
                Données Exemple
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tests Manuels de Membres
              </Typography>

              <TextField
                fullWidth
                label="Nom du membre"
                value={testMemberData.displayName}
                onChange={(e) => setTestMemberData(prev => ({ ...prev, displayName: e.target.value }))}
                margin="normal"
                size="small"
              />

              <TextField
                fullWidth
                label="Email du membre"
                value={testMemberData.email}
                onChange={(e) => setTestMemberData(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
                size="small"
              />
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={testAddMember}
                disabled={loading || !family}
                startIcon={<Person />}
                size="small"
              >
                Ajouter Membre
              </Button>

              <Button
                variant="outlined"
                onClick={testUpdateFamilyName}
                disabled={loading || !family}
                size="small"
              >
                Modifier Nom
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Danger Zone */}
      <Card sx={{ mb: 3, borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="error">
            Zone Dangereuse
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ces actions sont irréversibles.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            color="error"
            onClick={testLeaveFamily}
            disabled={loading || !family}
            startIcon={<Delete />}
            size="small"
          >
            Quitter Famille
          </Button>
        </CardActions>
      </Card>

      {/* Test Results */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Résultats des Tests
            </Typography>
            <Button
              variant="text"
              onClick={clearResults}
              size="small"
              startIcon={<Refresh />}
            >
              Effacer
            </Button>
          </Box>

          {testResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun test exécuté. Utilisez les boutons ci-dessus pour tester.
            </Typography>
          ) : (
            <List dense>
              {testResults.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getResultIcon(result.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.message}
                    secondary={result.timestamp}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default FamilyTest;
