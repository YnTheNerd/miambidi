/**
 * Lazy-loaded route components for better performance
 * Splits code and reduces initial bundle size
 */

import { lazy } from 'react';

// Lazy load heavy components
export const Dashboard = lazy(() => import('../../pages/Dashboard'));
export const Recipes = lazy(() => import('../../pages/Recipes'));
export const Ingredients = lazy(() => import('../../pages/Ingredients'));
export const Pantry = lazy(() => import('../../pages/Pantry'));
export const ShoppingList = lazy(() => import('../../pages/ShoppingList'));
export const FamilyManagement = lazy(() => import('../../pages/FamilyManagement'));
export const DragDropMealCalendar = lazy(() => import('../../components/calendar/DragDropMealCalendar'));

// Debug components (only load in development)
export const FirebaseTest = lazy(() => import('../../components/debug/FirebaseTest'));
export const AuthFlowTest = lazy(() => import('../../components/debug/AuthFlowTest'));
export const FamilyTest = lazy(() => import('../../components/debug/FamilyTest'));
export const AuthTest = lazy(() => import('../../components/debug/AuthTest'));
export const FirestoreSeederTest = lazy(() => import('../../components/debug/FirestoreSeederTest'));
export const IngredientSaveTest = lazy(() => import('../../components/debug/IngredientSaveTest'));
export const QuickIngredientTest = lazy(() => import('../../components/debug/QuickIngredientTest'));
export const IngredientSaveDebug = lazy(() => import('../../components/debug/IngredientSaveDebug'));
export const FamilyRecipeDebug = lazy(() => import('../../components/debug/FamilyRecipeDebug'));
export const RecipeTest = lazy(() => import('../../components/debug/RecipeTest'));

// Lightweight components that don't need lazy loading
export { default as LandingPage } from '../../pages/LandingPage';
export { default as AuthPage } from '../../pages/AuthPage';
