import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Box,
  Rating,
  Avatar
} from '@mui/material';
import {
  AccessTime,
  Group,
  Restaurant,
  Favorite,
  FavoriteBorder,
  Share,
  Edit,
  Delete,
  Visibility,
  Lock,
  Public,
  MoreVert
} from '@mui/icons-material';
import RecipeVisibilityChanger from './RecipeVisibilityChanger';
import RecipeImportMenu from './RecipeImportMenu';

function RecipeCard({
  recipe,
  currentUserId,
  currentFamilyId,
  currentFamilyName,
  isAdmin = false,
  onView,
  onEdit,
  onDelete,
  onShare,
  isFavorite,
  onToggleFavorite
}) {
  const [visibilityMenuAnchor, setVisibilityMenuAnchor] = useState(null);
  const [importMenuAnchor, setImportMenuAnchor] = useState(null);
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'success';
      case 'Moyen': return 'warning';
      case 'Difficile': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getDietaryChips = () => {
    const chips = [];
    const dietaryInfo = recipe.dietaryInfo || {};
    if (dietaryInfo.isVegetarian) chips.push('Végétarien');
    if (dietaryInfo.isVegan) chips.push('Végan');
    if (dietaryInfo.isGlutenFree) chips.push('Sans Gluten');
    if (dietaryInfo.isDairyFree) chips.push('Sans Lait');
    return chips.slice(0, 2); // Show max 2 dietary chips
  };

  const getVisibilityInfo = () => {
    switch (recipe.visibility) {
      case 'private':
        return {
          icon: <Lock />,
          label: 'Privé',
          bgcolor: '#ff9800', // Orange background
          color: '#ffffff' // White text
        };
      case 'family':
        return {
          icon: <Group />,
          label: 'Famille',
          bgcolor: '#2196f3', // Blue background
          color: '#ffffff' // White text
        };
      case 'public':
        return {
          icon: <Public />,
          label: 'Public',
          bgcolor: '#4caf50', // Green background
          color: '#ffffff' // White text
        };
      default:
        return {
          icon: <Group />,
          label: 'Famille',
          bgcolor: '#2196f3', // Blue background
          color: '#ffffff' // White text
        };
    }
  };

  const handleVisibilityMenuOpen = (event) => {
    event.stopPropagation();
    setVisibilityMenuAnchor(event.currentTarget);
  };

  const handleVisibilityMenuClose = () => {
    setVisibilityMenuAnchor(null);
  };

  const handleImportMenuOpen = (event) => {
    setImportMenuAnchor(event.currentTarget);
  };

  const handleImportMenuClose = () => {
    setImportMenuAnchor(null);
  };

  return (
    <Card
      sx={{
        minHeight: 420, // Increased minimum height for better content display
        height: '100%', // Allow dynamic height based on container
        width: '100%',
        minWidth: 280, // Minimum width constraint
        maxWidth: 450, // Increased maximum width constraint
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Recipe Image with Fallback Handling */}
      <CardMedia
        component="div"
        sx={{
          height: 200, // Increased image height for better visual presentation
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: recipe.imageUrl || recipe.image
            ? `url(${recipe.imageUrl || recipe.image})`
            : 'none',
          backgroundSize: 'cover', // Ensures image fills entire area optimally
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          // Fallback styling when no image
          ...(!(recipe.imageUrl || recipe.image) && {
            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
            color: 'white'
          })
        }}
      >
        {/* Fallback content when no image */}
        {!(recipe.imageUrl || recipe.image) && (
          <Box sx={{ textAlign: 'center' }}>
            <Restaurant sx={{ fontSize: 48, mb: 1, opacity: 0.8 }} />
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {recipe.cuisine || 'Recette'}
            </Typography>
          </Box>
        )}

        {/* Favorite Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
          }}
          onClick={() => onToggleFavorite(recipe.id)}
        >
          {isFavorite ?
            <Favorite color="error" /> :
            <FavoriteBorder />
          }
        </IconButton>

        {/* Difficulty Badge */}
        <Chip
          label={recipe.difficulty || 'Non spécifié'}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: '#ffffff',
            color: '#ff9800',
            fontWeight: 'bold',
            border: '1px solid #ff9800'
          }}
        />

        {/* Visibility Badge */}
        <Chip
          icon={getVisibilityInfo().icon}
          label={getVisibilityInfo().label}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: getVisibilityInfo().bgcolor,
            color: getVisibilityInfo().color,
            fontWeight: 500,
            '& .MuiChip-icon': {
              color: getVisibilityInfo().color
            }
          }}
        />
      </CardMedia>

      {/* Recipe Content - Enhanced for Dynamic Heights */}
      <CardContent sx={{
        flexGrow: 1,
        pb: 1,
        overflow: 'hidden',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100% - 200px - 52px)' // Dynamic height calculation
      }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: '1rem', // 16px font size
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2, // 2-line maximum
            WebkitBoxOrient: 'vertical',
            mb: 1.5,
            fontWeight: 600
          }}
        >
          {recipe.name || 'Recette sans nom'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.85rem', // Slightly larger for better readability
            lineHeight: 1.5,
            mb: 1.5,
            flexGrow: 1, // Allow description to take available space
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 6, // Increased to 6 lines for better content display
            WebkitBoxOrient: 'vertical',
            maxHeight: '7.5em' // Approximately 6 lines at 1.5 line height
          }}
        >
          {recipe.description || 'Aucune description disponible'}
        </Typography>

        {/* Recipe Meta - Enhanced Layout */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Group fontSize="small" color="action" />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {recipe.servings || 1} pers.
            </Typography>
          </Box>

          <Chip
            label={recipe.difficulty || 'Moyen'}
            size="small"
            sx={{
              height: '22px',
              fontSize: '0.7rem',
              bgcolor: '#fff3e0',
              color: '#f57c00',
              fontWeight: 'bold',
              border: '1px solid #ffb74d'
            }}
          />
        </Box>

        {/* Additional metadata row for prep and cook times */}
        {(recipe.prepTime || recipe.cookTime) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            {recipe.prepTime && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Préparation: {recipe.prepTime}min
              </Typography>
            )}
            {recipe.cookTime && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Cuisson: {recipe.cookTime}min
              </Typography>
            )}
          </Box>
        )}

        {/* Compact Info Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={recipe.cuisine || 'Camerounaise'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: '20px' }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={recipe.rating || 0} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              ({recipe.reviews || 0})
            </Typography>
          </Box>
        </Box>

        {/* Dietary Information - Compact */}
        {getDietaryChips().length > 0 && (
          <Box sx={{ mb: 1 }}>
            {getDietaryChips().slice(0, 2).map((dietary) => (
              <Chip
                key={dietary}
                label={dietary}
                size="small"
                color="success"
                variant="outlined"
                sx={{ mr: 0.5, fontSize: '0.6rem', height: '18px' }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      {/* Recipe Actions */}
      <CardActions sx={{
        justifyContent: 'space-between',
        px: 2,
        pb: 2,
        pt: 1,
        height: 52, // Fixed height for actions
        minHeight: 52
      }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<Visibility />}
          onClick={() => onView(recipe)}
          sx={{ fontSize: '0.75rem', height: '32px' }}
        >
          Voir
        </Button>

        <Box>
          <IconButton
            size="small"
            onClick={() => onShare(recipe)}
            title="Partager"
          >
            <Share />
          </IconButton>

          {/* Determine what actions are available based on recipe type and permissions */}
          {(() => {
            const isCreator = currentUserId === recipe.createdBy;
            // Enhanced editing permissions: original creator OR importer OR admin can edit
            const canEditByOwnership = recipe.ownership?.canEdit?.includes(currentUserId) || false;

            // NEW: Family admins can edit ANY recipe created by their family members
            // This includes private, family, and public recipes created by family members
            const canEditAsAdmin = isAdmin && currentFamilyId && (
              // For private and family recipes, check if they belong to the admin's family
              (recipe.familyId === currentFamilyId) ||
              // For public recipes, allow admin editing (they can manage family member recipes)
              (recipe.visibility === 'public' && isAdmin)
            );

            // MiamBidi Requirements: Family admins can edit ALL recipes (including private imported ones)
            const canEdit = isCreator || canEditByOwnership || canEditAsAdmin;

            // Only original creator or person who promoted to public can change visibility
            const canChangeVisibility = isCreator || (recipe.ownership?.lastPromotedBy === currentUserId) || isAdmin;
            // Enhanced deletion permissions: Recipe creators can delete ANY recipe they created
            // Family admins can delete ANY recipe within their family scope
            const canDelete = isCreator || (isAdmin && currentFamilyId && (
              recipe.familyId === currentFamilyId ||
              (recipe.visibility === 'public' && isAdmin)
            ));
            const isPublicRecipe = recipe.visibility === 'public';

            // For public recipes, show import menu instead of edit options
            if (isPublicRecipe && !canEdit) {
              return (
                <IconButton
                  size="small"
                  onClick={handleImportMenuOpen}
                  title="Importer la recette"
                >
                  <MoreVert />
                </IconButton>
              );
            }

            // For recipes the user can edit, show full menu
            if (canEdit || canChangeVisibility || canDelete) {
              return (
                <>
                  <IconButton
                    size="small"
                    onClick={handleVisibilityMenuOpen}
                    title="Changer la visibilité"
                  >
                    <MoreVert />
                  </IconButton>
                  {canEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(recipe)}
                      title="Modifier"
                    >
                      <Edit />
                    </IconButton>
                  )}
                  {canDelete && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(recipe)}
                      title="Supprimer"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </>
              );
            }

            return null;
          })()}
        </Box>

        {/* Visibility Changer Menu - For recipe creators and admins */}
        {(currentUserId === recipe.createdBy || isAdmin) && (
          <RecipeVisibilityChanger
            recipe={recipe}
            anchorEl={visibilityMenuAnchor}
            open={Boolean(visibilityMenuAnchor)}
            onClose={handleVisibilityMenuClose}
            currentUserId={currentUserId}
            currentFamilyId={currentFamilyId}
            isAdmin={isAdmin}
          />
        )}

        {/* Import Menu - For public recipes */}
        {recipe.visibility === 'public' && (
          <RecipeImportMenu
            recipe={recipe}
            anchorEl={importMenuAnchor}
            open={Boolean(importMenuAnchor)}
            onClose={handleImportMenuClose}
            currentUserId={currentUserId}
            currentFamilyId={currentFamilyId}
            currentFamilyName={currentFamilyName}
          />
        )}
      </CardActions>
    </Card>
  );
}

export default RecipeCard;
