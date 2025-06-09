import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AppProviders from './providers/AppProviders';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import RecipeSeeder from './components/debug/RecipeSeeder';
import {
  LandingPage,
  AuthPage,
  Dashboard,
  Recipes,
  Ingredients,
  Pantry,
  ShoppingList,
  FamilyManagement,
  DragDropMealCalendar,
  FirebaseTest,
  AuthFlowTest,
  FamilyTest,
  AuthTest,
  FirestoreSeederTest,
  IngredientSaveTest,
  QuickIngredientTest,
  IngredientSaveDebug,
  FamilyRecipeDebug,
  RecipeTest
} from './components/routing/LazyRoutes';

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={60} />
    <Box sx={{ color: 'text.secondary' }}>Chargement...</Box>
  </Box>
);

function App() {
  return (
    <AppProviders>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } />
            <Route path="/recettes-publiques" element={<div>Public Recipes (Coming Soon)</div>} />
            <Route path="/blogs" element={<div>Blog (Coming Soon)</div>} />

            {/* Development/Admin Routes - Only accessible in development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Route path="/firebase-test" element={<FirebaseTest />} />
                <Route path="/auth-test" element={<AuthFlowTest />} />
                <Route path="/family-test" element={<FamilyTest />} />
                <Route path="/auth-debug" element={<AuthTest />} />
                <Route path="/firestore-seeder" element={<FirestoreSeederTest />} />
                <Route path="/recipe-seeder" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RecipeSeeder />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recipe-test" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RecipeTest />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/ingredient-save-test" element={<IngredientSaveTest />} />
                <Route path="/quick-ingredient-test" element={<QuickIngredientTest />} />
                <Route path="/ingredient-save-debug" element={<IngredientSaveDebug />} />
                <Route path="/family-recipe-debug" element={<FamilyRecipeDebug />} />
              </>
            )}

            {/* Protected Routes with Optimized Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/calendar" element={
              <ProtectedRoute>
                <AppLayout>
                  <DragDropMealCalendar />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/recipes" element={
              <ProtectedRoute>
                <AppLayout>
                  <Recipes />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/ingredients" element={
              <ProtectedRoute>
                <AppLayout>
                  <Ingredients />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/garde-manger" element={
              <ProtectedRoute>
                <AppLayout>
                  <Pantry />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/liste-courses" element={
              <ProtectedRoute>
                <AppLayout>
                  <ShoppingList />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/family" element={
              <ProtectedRoute>
                <AppLayout>
                  <FamilyManagement />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="/shopping" element={<Navigate to="/liste-courses" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AppProviders>
  );
}

export default App;

