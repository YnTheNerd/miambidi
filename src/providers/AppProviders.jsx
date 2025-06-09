/**
 * Optimized App Providers
 * Reduces context provider nesting and improves performance
 */

import React, { memo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { FirestoreFamilyProvider } from '../contexts/FirestoreFamilyContext';
import { IngredientProvider } from '../contexts/IngredientContext';
import { PantryProvider } from '../contexts/PantryContext';
import { RecipeProvider } from '../contexts/RecipeContext';
import { ShoppingListProvider } from '../contexts/ShoppingListContext';
import { MealPlanProvider } from '../contexts/MealPlanContext';

// Create enhanced theme with smooth animations and transitions
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green theme for food/nature
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6F00', // Orange accent
      light: '#FF8F00',
      dark: '#E65100',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  // Enhanced transitions and animations
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  // Enhanced component styling with animations
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Optimize font loading
        '@font-face': {
          fontFamily: 'Roboto',
          fontDisplay: 'swap', // Improve font loading performance
        },
        // Global smooth scrolling
        html: {
          scrollBehavior: 'smooth',
        },
        // Enhanced body styling
        body: {
          transition: 'background-color 0.3s ease',
        },
      },
    },
    // Enhanced Button animations
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    // Enhanced Card animations
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    // Enhanced Paper animations
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    // Enhanced AppBar styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(46, 125, 50, 0.95)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    // Enhanced Drawer animations
    MuiDrawer: {
      styleOverrides: {
        paper: {
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    // Enhanced List Item animations
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(46, 125, 50, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.16)',
            },
          },
        },
      },
    },
    // Enhanced TextField animations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(46, 125, 50, 0.5)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    // Enhanced Chip animations
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    // Enhanced Dialog animations
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    // Enhanced Fab animations
    MuiFab: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

// Memoized provider wrapper to prevent unnecessary re-renders
const ContextProviders = memo(({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FirestoreFamilyProvider>
          <IngredientProvider>
            <PantryProvider>
              <RecipeProvider>
                <MealPlanProvider>
                  <ShoppingListProvider>
                    {children}
                  </ShoppingListProvider>
                </MealPlanProvider>
              </RecipeProvider>
            </PantryProvider>
          </IngredientProvider>
        </FirestoreFamilyProvider>
      </NotificationProvider>
    </AuthProvider>
  );
});

ContextProviders.displayName = 'ContextProviders';

const AppProviders = memo(({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContextProviders>
        {children}
      </ContextProviders>
    </ThemeProvider>
  );
});

AppProviders.displayName = 'AppProviders';

export default AppProviders;
