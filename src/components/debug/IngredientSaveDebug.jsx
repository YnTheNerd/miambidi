/**
 * 🔍 Ingredient Save Debug Component
 * Comprehensive debugging for ingredient save failures
 */

import React, { useState, useEffect } from 'react';
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
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Error,
  Refresh,
  BugReport,
  ExpandMore,
  Storage,
  Visibility,
  Search
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useIngredients } from '../../contexts/IngredientContext';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

function IngredientSaveDebug() {
  const { currentUser } = useAuth();
  const { family } = useFamily();
  const { 
    ingredients, 
    publicIngredients,
    familyIngredients,
    addIngredient, 
    loading, 
    error
  } = useIngredients();
  
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState([]);
  const [testIngredientId, setTestIngredientId] = useState(null);
  const [firestoreData, setFirestoreData] = useState(null);
  const [debugError, setDebugError] = useState(null);

  const addDebugResult = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugResults(prev => [...prev, {
      type,
      message,
      data,
      timestamp
    }]);
  };

  const clearDebugResults = () => {
    setDebugResults([]);
    setTestIngredientId(null);
    setFirestoreData(null);
    setDebugError(null);
  };

  const runComprehensiveDebug = async () => {
    setIsDebugging(true);
    setDebugError(null);
    clearDebugResults();

    try {
      // Step 1: Check authentication and family
      addDebugResult('info', '🔍 Checking authentication and family...');
      
      if (!currentUser) {
        addDebugResult('error', '❌ No authenticated user found');
        throw new Error('User not authenticated');
      }
      addDebugResult('success', `✅ User authenticated: ${currentUser.email}`);
      
      if (!family?.id) {
        addDebugResult('error', '❌ No family assigned to user');
        throw new Error('No family assigned');
      }
      addDebugResult('success', `✅ Family assigned: ${family.name} (ID: ${family.id})`);

      // Step 2: Test ingredient creation
      addDebugResult('info', '🧪 Creating test ingredient...');
      
      const testIngredient = {
        name: `Debug Test ${Date.now()}`,
        description: 'Test ingredient for debugging save issues',
        price: 100,
        category: 'Autres',
        unit: 'pièce',
        isPublic: true,
        aliases: ['debug', 'test'],
        notes: 'Created for debugging purposes',
        storageInstructions: 'Debug storage',
        averageShelfLife: 1,
        seasonality: [],
        tags: ['debug', 'test']
      };

      addDebugResult('info', '📝 Test ingredient data:', testIngredient);

      const createdIngredient = await addIngredient(testIngredient);
      setTestIngredientId(createdIngredient.id);
      
      addDebugResult('success', `✅ Ingredient created with ID: ${createdIngredient.id}`);
      addDebugResult('info', '📊 Created ingredient data:', createdIngredient);

      // Step 3: Verify Firestore save
      addDebugResult('info', '🔍 Verifying Firestore save...');
      
      // Wait a moment for Firestore to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const ingredientRef = doc(db, 'ingredients', createdIngredient.id);
        const docSnap = await getDoc(ingredientRef);
        
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          setFirestoreData(firestoreData);
          addDebugResult('success', '✅ Ingredient found in Firestore');
          addDebugResult('info', '📄 Firestore document data:', firestoreData);
          
          // Verify key fields
          const requiredFields = ['id', 'name', 'isPublic', 'familyId', 'createdBy'];
          const missingFields = requiredFields.filter(field => !firestoreData[field]);
          
          if (missingFields.length === 0) {
            addDebugResult('success', '✅ All required fields present in Firestore');
          } else {
            addDebugResult('warning', `⚠️ Missing fields in Firestore: ${missingFields.join(', ')}`);
          }
          
          // Check visibility
          if (firestoreData.isPublic === true) {
            addDebugResult('success', '✅ Ingredient correctly saved as public');
          } else {
            addDebugResult('error', `❌ Ingredient visibility incorrect: isPublic = ${firestoreData.isPublic}`);
          }
          
        } else {
          addDebugResult('error', '❌ Ingredient NOT found in Firestore');
          throw new Error('Ingredient not saved to Firestore');
        }
      } catch (firestoreError) {
        addDebugResult('error', `❌ Firestore verification failed: ${firestoreError.message}`);
        throw firestoreError;
      }

      // Step 4: Check real-time synchronization
      addDebugResult('info', '🔄 Checking real-time synchronization...');
      
      // Wait for real-time updates
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const foundInIngredients = ingredients.find(ing => ing.id === createdIngredient.id);
      const foundInPublic = publicIngredients.find(ing => ing.id === createdIngredient.id);
      const foundInFamily = familyIngredients.find(ing => ing.id === createdIngredient.id);
      
      if (foundInIngredients) {
        addDebugResult('success', '✅ Ingredient found in main ingredients list');
      } else {
        addDebugResult('error', '❌ Ingredient NOT found in main ingredients list');
      }
      
      if (foundInPublic) {
        addDebugResult('success', '✅ Ingredient found in public ingredients list');
      } else {
        addDebugResult('error', '❌ Ingredient NOT found in public ingredients list');
      }
      
      if (foundInFamily) {
        addDebugResult('success', '✅ Ingredient found in family ingredients list');
      } else {
        addDebugResult('error', '❌ Ingredient NOT found in family ingredients list');
      }

      // Step 5: Test direct Firestore query
      addDebugResult('info', '🔍 Testing direct Firestore queries...');
      
      try {
        // Query all ingredients
        const allIngredientsQuery = query(collection(db, 'ingredients'));
        const allIngredientsSnap = await getDocs(allIngredientsQuery);
        addDebugResult('info', `📊 Total ingredients in Firestore: ${allIngredientsSnap.docs.length}`);
        
        // Query public ingredients
        const publicQuery = query(collection(db, 'ingredients'), where('isPublic', '==', true));
        const publicSnap = await getDocs(publicQuery);
        addDebugResult('info', `📊 Public ingredients in Firestore: ${publicSnap.docs.length}`);
        
        // Query family ingredients
        const familyQuery = query(collection(db, 'ingredients'), where('familyId', '==', family.id));
        const familySnap = await getDocs(familyQuery);
        addDebugResult('info', `📊 Family ingredients in Firestore: ${familySnap.docs.length}`);
        
        // Check if our test ingredient is in the queries
        const testInAll = allIngredientsSnap.docs.find(doc => doc.id === createdIngredient.id);
        const testInPublic = publicSnap.docs.find(doc => doc.id === createdIngredient.id);
        const testInFamily = familySnap.docs.find(doc => doc.id === createdIngredient.id);
        
        addDebugResult(testInAll ? 'success' : 'error', 
          testInAll ? '✅ Test ingredient found in all ingredients query' : '❌ Test ingredient NOT in all ingredients query');
        addDebugResult(testInPublic ? 'success' : 'error', 
          testInPublic ? '✅ Test ingredient found in public query' : '❌ Test ingredient NOT in public query');
        addDebugResult(testInFamily ? 'success' : 'error', 
          testInFamily ? '✅ Test ingredient found in family query' : '❌ Test ingredient NOT in family query');
        
      } catch (queryError) {
        addDebugResult('error', `❌ Direct Firestore query failed: ${queryError.message}`);
      }

      addDebugResult('success', '🎉 Debug completed successfully!');

    } catch (error) {
      console.error('❌ Debug failed:', error);
      setDebugError(error.message);
      addDebugResult('error', `❌ Debug failed: ${error.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🔍 Ingredient Save Debug
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Comprehensive debugging tool for ingredient save failures and Firestore synchronization issues.
      </Typography>

      {/* Current State */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Current State
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography><strong>User:</strong> {currentUser ? currentUser.email : 'Not authenticated'}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Family:</strong> {family ? family.name : 'No family'}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Total Ingredients:</strong> {ingredients.length}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography><strong>Public Ingredients:</strong> {publicIngredients.length}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {(error || debugError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || debugError}
        </Alert>
      )}

      {/* Debug Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ Debug Controls
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={isDebugging ? <CircularProgress size={20} /> : <BugReport />}
            onClick={runComprehensiveDebug}
            disabled={isDebugging || !currentUser || !family?.id}
            color="primary"
          >
            {isDebugging ? 'Debugging...' : 'Run Comprehensive Debug'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={clearDebugResults}
            disabled={isDebugging}
          >
            Clear Results
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            disabled={isDebugging}
          >
            Refresh Page
          </Button>
        </Box>
      </Paper>

      {/* Debug Results */}
      {debugResults.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📈 Debug Results
          </Typography>
          
          <List dense>
            {debugResults.map((result, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {result.type === 'success' && <CheckCircle color="success" />}
                      {result.type === 'error' && <Error color="error" />}
                      {result.type === 'warning' && <Error color="warning" />}
                      {result.type === 'info' && <Storage color="info" />}
                      <Typography variant="body2">
                        [{result.timestamp}] {result.message}
                      </Typography>
                    </Box>
                  }
                  secondary={result.data && (
                    <Box component="pre" sx={{ 
                      fontSize: '0.75rem', 
                      mt: 1, 
                      p: 1, 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </Box>
                  )}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Firestore Data Display */}
      {firestoreData && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">📄 Firestore Document Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="pre" sx={{ 
              fontSize: '0.875rem',
              bgcolor: 'background.default',
              p: 2,
              borderRadius: 1,
              overflow: 'auto'
            }}>
              {JSON.stringify(firestoreData, null, 2)}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          📝 Debug Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. <strong>Ensure authentication:</strong> Make sure you're logged in and have a family assigned
        </Typography>
        <Typography variant="body2" paragraph>
          2. <strong>Run debug:</strong> Click "Run Comprehensive Debug" to test ingredient creation
        </Typography>
        <Typography variant="body2" paragraph>
          3. <strong>Check results:</strong> Review each step to identify where the process fails
        </Typography>
        <Typography variant="body2" paragraph>
          4. <strong>Verify Firestore:</strong> Check if ingredients are actually saved to the database
        </Typography>
        <Typography variant="body2">
          5. <strong>Test synchronization:</strong> Verify real-time updates work correctly
        </Typography>
      </Paper>
    </Box>
  );
}

export default IngredientSaveDebug;
