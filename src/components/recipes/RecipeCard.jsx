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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Recipe Image */}
      <CardMedia
        component="div"
        sx={{
          height: 200,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: `url(${recipe.imageUrl || recipe.image || '/images/recipes/default-meal.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >


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

      {/* Recipe Content */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {recipe.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {recipe.description}
        </Typography>

        {/* Recipe Meta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption">
              {formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Group fontSize="small" color="action" />
            <Typography variant="caption">
              {recipe.servings || 1} pers.
            </Typography>
          </Box>
        </Box>

        {/* Cuisine and Categories */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={recipe.cuisine || 'Non spécifié'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
          {(recipe.categories || []).slice(0, 1).map((category) => (
            <Chip
              key={category}
              label={category}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>

        {/* Dietary Information */}
        <Box sx={{ mb: 2 }}>
          {getDietaryChips().map((dietary) => (
            <Chip
              key={dietary}
              label={dietary}
              size="small"
              color="success"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
            />
          ))}
        </Box>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={recipe.rating || 0} precision={0.1} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">
            ({recipe.reviews || 0})
          </Typography>
        </Box>
      </CardContent>

      {/* Recipe Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<Visibility />}
          onClick={() => onView(recipe)}
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
            const canEdit = isCreator || (isAdmin && recipe.visibility !== 'public');
            const canChangeVisibility = isCreator || isAdmin;
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
