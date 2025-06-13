import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import {
  Download,
  Group,
  Lock,
  Warning
} from '@mui/icons-material';
import { useRecipes } from '../../contexts/RecipeContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RecipeImportMenu Component
 * Provides import options for public recipes
 */
function RecipeImportMenu({
  recipe,
  anchorEl,
  open,
  onClose,
  currentUserId,
  currentFamilyId
}) {
  const { importRecipe } = useRecipes();
  const { currentFamily } = useFamily();
  const { currentUser } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState(null);

  const importOptions = [
    {
      type: 'family',
      label: 'Importer vers la Famille',
      icon: <Group />,
      description: 'Créer une copie modifiable pour votre famille',
      color: 'primary.main',
      disabled: !currentFamily
    },
    {
      type: 'private',
      label: 'Importer en Privé',
      icon: <Lock />,
      description: 'Créer une copie privée que vous pouvez modifier',
      color: 'warning.main',
      disabled: false
    }
  ];

  const handleImportSelect = (importType) => {
    setSelectedImportType(importType);
    setConfirmDialogOpen(true);
    onClose();
  };

  const handleConfirmImport = async () => {
    if (selectedImportType) {
      try {
        await importRecipe(
          recipe,
          selectedImportType,
          currentUserId,
          currentFamilyId,
          currentFamily?.name,
          currentUser?.displayName || currentUser?.email || 'Utilisateur'
        );
        setConfirmDialogOpen(false);
        setSelectedImportType(null);
      } catch (error) {
        console.error('Error importing recipe:', error);
        // Error is handled by the context
      }
    }
  };

  const handleCancelImport = () => {
    setConfirmDialogOpen(false);
    setSelectedImportType(null);
  };

  const getImportWarning = (importType) => {
    if (importType === 'family') {
      return "Cette recette sera copiée dans votre collection familiale. Vous et les autres membres de votre famille pourrez la modifier.";
    }
    if (importType === 'private') {
      return "Cette recette sera copiée dans votre collection privée. Vous seul pourrez la voir et la modifier.";
    }
    return null;
  };

  const getImportedRecipeName = (importType) => {
    if (importType === 'family') {
      const isOriginalFromCurrentFamily = recipe.familyId === currentFamilyId;
      return isOriginalFromCurrentFamily
        ? recipe.name
        : `${recipe.name} (par ${currentFamily?.name || 'Famille'})`;
    }
    if (importType === 'private') {
      const displayName = currentUser?.displayName || currentUser?.email || 'Utilisateur';
      return `${recipe.name} (importé par ${displayName})`;
    }
    return recipe.name;
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 280 }
          }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText 
            primary="Importer cette recette"
            secondary="Créer une copie modifiable"
          />
        </MenuItem>
        
        {importOptions.map((option) => (
          <MenuItem
            key={option.type}
            onClick={() => handleImportSelect(option.type)}
            disabled={option.disabled}
            sx={{
              '&:hover': {
                backgroundColor: option.disabled ? 'inherit' : `${option.color}15`
              }
            }}
          >
            <ListItemIcon sx={{ color: option.disabled ? 'text.disabled' : option.color }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText
              primary={option.label}
              secondary={option.disabled ? 'Famille requise' : option.description}
              sx={{
                '& .MuiListItemText-primary': {
                  color: option.disabled ? 'text.disabled' : 'text.primary'
                },
                '& .MuiListItemText-secondary': {
                  color: option.disabled ? 'text.disabled' : 'text.secondary'
                }
              }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Import Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelImport}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmer l'importation de la recette
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {recipe.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              par {recipe.createdBy}
            </Typography>
          </Box>

          {selectedImportType && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Nouveau nom de la recette :
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                {getImportedRecipeName(selectedImportType)}
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                {getImportWarning(selectedImportType)}
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Important :</strong> La recette originale publique ne sera pas modifiée. 
                  Vous créez une copie indépendante que vous pouvez modifier librement.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelImport}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmImport} 
            variant="contained"
            startIcon={selectedImportType === 'family' ? <Group /> : <Lock />}
          >
            Importer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RecipeImportMenu;
