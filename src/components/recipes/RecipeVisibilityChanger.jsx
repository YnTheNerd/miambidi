import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert
} from '@mui/material';
import {
  Lock,
  Group,
  Public,
  Visibility,
  Warning
} from '@mui/icons-material';
import { useRecipes } from '../../contexts/RecipeContext';

/**
 * RecipeVisibilityChanger Component
 * Provides a dropdown menu to change recipe visibility with confirmation dialog
 */
function RecipeVisibilityChanger({
  recipe,
  anchorEl,
  open,
  onClose,
  currentUserId,
  currentFamilyId,
  isAdmin = false
}) {
  const { changeRecipeVisibility, VISIBILITY_TYPES } = useRecipes();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(null);

  const visibilityOptions = [
    {
      value: VISIBILITY_TYPES.PRIVATE,
      label: 'Privé (Personnel)',
      icon: <Lock />,
      description: 'Visible uniquement par vous',
      color: 'warning.main'
    },
    {
      value: VISIBILITY_TYPES.FAMILY,
      label: 'Famille',
      icon: <Group />,
      description: 'Visible par tous les membres de votre famille',
      color: 'primary.main'
    },
    {
      value: VISIBILITY_TYPES.PUBLIC,
      label: 'Public',
      icon: <Public />,
      description: 'Visible par toute la communauté MiamBidi',
      color: 'success.main'
    }
  ];

  // Check if user can change visibility
  const canChangeVisibility = () => {
    // Recipe creators can always change visibility of their own recipes
    const isCreator = recipe.createdBy === currentUserId;

    // Family admins can change visibility of ANY recipe created by their family members
    // This includes private, family, and public recipes created by family members
    const isFamilyAdmin = isAdmin && currentFamilyId && (
      // For private and family recipes, check if they belong to the admin's family
      (recipe.familyId === currentFamilyId) ||
      // For public recipes, check if the creator is a family member (would need family member list)
      // For now, we'll allow admins to manage any recipe if they have admin rights
      (recipe.visibility === VISIBILITY_TYPES.PUBLIC && isAdmin)
    );

    return isCreator || isFamilyAdmin;
  };

  const handleVisibilitySelect = (newVisibility) => {
    if (newVisibility === recipe.visibility) {
      onClose();
      return;
    }

    setSelectedVisibility(newVisibility);
    setConfirmDialogOpen(true);
    onClose();
  };

  const handleConfirmChange = () => {
    if (selectedVisibility) {
      changeRecipeVisibility(recipe.id, selectedVisibility, currentUserId, currentFamilyId, isAdmin);
      setConfirmDialogOpen(false);
      setSelectedVisibility(null);
    }
  };

  const handleCancelChange = () => {
    setConfirmDialogOpen(false);
    setSelectedVisibility(null);
  };

  const getVisibilityWarning = (newVisibility) => {
    const currentVisibility = recipe.visibility;

    // Private → Family
    if (newVisibility === VISIBILITY_TYPES.FAMILY && currentVisibility === VISIBILITY_TYPES.PRIVATE) {
      return "Cette recette sera partagée avec tous les membres de votre famille.";
    }

    // Private → Public
    if (newVisibility === VISIBILITY_TYPES.PUBLIC && currentVisibility === VISIBILITY_TYPES.PRIVATE) {
      return "Cette recette sera visible par tous les utilisateurs de MiamBidi. Assurez-vous qu'elle ne contient pas d'informations personnelles.";
    }

    // Family → Private
    if (newVisibility === VISIBILITY_TYPES.PRIVATE && currentVisibility === VISIBILITY_TYPES.FAMILY) {
      return "Cette recette ne sera plus accessible aux autres membres de votre famille.";
    }

    // Family → Public
    if (newVisibility === VISIBILITY_TYPES.PUBLIC && currentVisibility === VISIBILITY_TYPES.FAMILY) {
      return "Cette recette sera visible par toute la communauté MiamBidi, pas seulement votre famille.";
    }

    // Public → Private
    if (newVisibility === VISIBILITY_TYPES.PRIVATE && currentVisibility === VISIBILITY_TYPES.PUBLIC) {
      return "Cette recette ne sera plus visible par la communauté publique ni votre famille.";
    }

    // Public → Family
    if (newVisibility === VISIBILITY_TYPES.FAMILY && currentVisibility === VISIBILITY_TYPES.PUBLIC) {
      return "Cette recette ne sera plus visible par la communauté publique, seulement votre famille.";
    }

    return null;
  };

  if (!canChangeVisibility()) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Warning color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Accès refusé"
            secondary="Seuls le créateur de la recette et les admins familiaux peuvent modifier la visibilité"
          />
        </MenuItem>
      </Menu>
    );
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 280 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Visibility />
          </ListItemIcon>
          <ListItemText 
            primary="Changer la visibilité"
            secondary="Sélectionnez un nouveau niveau de partage"
          />
        </MenuItem>
        <Divider />
        
        {visibilityOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleVisibilitySelect(option.value)}
            selected={recipe.visibility === option.value}
            sx={{
              '&.Mui-selected': {
                backgroundColor: `${option.color}15`,
                '&:hover': {
                  backgroundColor: `${option.color}25`
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: option.color }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    {option.label}
                  </Typography>
                  {recipe.visibility === option.value && (
                    <Typography variant="caption" color="primary">
                      (Actuel)
                    </Typography>
                  )}
                </Box>
              }
              secondary={option.description}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelChange}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmer le changement de visibilité
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Êtes-vous sûr de vouloir changer la visibilité de "{recipe.name}" ?
            </Typography>
            
            {selectedVisibility && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Nouveau niveau de visibilité :
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {visibilityOptions.find(opt => opt.value === selectedVisibility)?.icon}
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {visibilityOptions.find(opt => opt.value === selectedVisibility)?.label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {visibilityOptions.find(opt => opt.value === selectedVisibility)?.description}
                </Typography>
              </Box>
            )}

            {selectedVisibility && getVisibilityWarning(selectedVisibility) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {getVisibilityWarning(selectedVisibility)}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelChange}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmChange} 
            variant="contained"
            color="primary"
          >
            Confirmer le changement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RecipeVisibilityChanger;
