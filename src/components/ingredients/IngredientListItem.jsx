/**
 * IngredientListItem Component for MiamBidi
 * Displays ingredient information in a list format
 */

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Restaurant,
  Public,
  Lock,
  TrendingUp,
  Schedule,
  LocalOffer
} from '@mui/icons-material';

function IngredientListItem({ 
  ingredient, 
  onEdit, 
  onDelete, 
  canEdit, 
  formatPrice 
}) {
  const getCategoryColor = (category) => {
    const colors = {
      'Légumes-feuilles & Aromates': 'success',
      'Viandes & Poissons': 'error',
      'Céréales & Légumineuses': 'warning',
      'Tubercules & Plantains': 'info',
      'Épices & Piments': 'secondary',
      'Huiles & Condiments': 'primary',
      'Produits laitiers': 'default',
      'Fruits': 'success',
      'Boissons': 'info',
      'Autres': 'default'
    };
    return colors[category] || 'default';
  };

  const getUsageLevel = (usageCount) => {
    if (usageCount >= 10) return { level: 'high', color: 'success', label: 'Très utilisé' };
    if (usageCount >= 5) return { level: 'medium', color: 'warning', label: 'Utilisé' };
    if (usageCount >= 1) return { level: 'low', color: 'info', label: 'Peu utilisé' };
    return { level: 'none', color: 'default', label: 'Jamais utilisé' };
  };

  const usage = getUsageLevel(ingredient.usageCount || 0);
  const isRecent = ingredient.createdAt && 
    new Date(ingredient.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <Paper 
      sx={{ 
        p: 2,
        '&:hover': {
          boxShadow: 2,
          backgroundColor: 'action.hover'
        }
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Avatar and Basic Info */}
        <Grid item xs={12} sm={4} md={3}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: `${getCategoryColor(ingredient.category)}.main`,
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              <Restaurant />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3">
                {ingredient.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip 
                  label={ingredient.category} 
                  size="small" 
                  color={getCategoryColor(ingredient.category)}
                  variant="outlined"
                />
                {ingredient.isPublic ? (
                  <Chip
                    icon={<Public />}
                    label="Public"
                    size="small"
                    color="info"
                  />
                ) : (
                  <Chip
                    icon={<Lock />}
                    label="Famille"
                    size="small"
                    color="default"
                  />
                )}
                {isRecent && (
                  <Chip
                    label="Nouveau"
                    size="small"
                    color="secondary"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Description */}
        <Grid item xs={12} sm={4} md={4}>
          <Box>
            {ingredient.description ? (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {ingredient.description}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                Aucune description
              </Typography>
            )}

            {/* Aliases */}
            {ingredient.aliases && ingredient.aliases.length > 0 && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Aussi: {ingredient.aliases.slice(0, 2).join(', ')}
                {ingredient.aliases.length > 2 && '...'}
              </Typography>
            )}

            {/* Storage and Seasonality */}
            <Box mt={1}>
              {ingredient.storageInstructions && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Conservation: {ingredient.storageInstructions}
                </Typography>
              )}
              {ingredient.seasonality && ingredient.seasonality.length > 0 && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Saison: {ingredient.seasonality.slice(0, 3).join(', ')}
                  {ingredient.seasonality.length > 3 && '...'}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Price and Unit */}
        <Grid item xs={12} sm={2} md={2}>
          <Box textAlign="center">
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              {formatPrice(ingredient.price)}
            </Typography>
            <Chip 
              label={`par ${ingredient.unit}`} 
              size="small" 
              variant="outlined" 
            />
            
            {/* Additional Info */}
            <Box mt={1}>
              {ingredient.averageShelfLife && (
                <Tooltip title={`Durée de conservation: ${ingredient.averageShelfLife} jours`}>
                  <Chip
                    icon={<Schedule />}
                    label={`${ingredient.averageShelfLife}j`}
                    size="small"
                    variant="outlined"
                    color="info"
                    sx={{ mb: 0.5 }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Usage Stats and Actions */}
        <Grid item xs={12} sm={2} md={3}>
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            {/* Usage Statistics */}
            {ingredient.usageCount > 0 && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUp 
                  fontSize="small" 
                  color={usage.color}
                />
                <Typography variant="caption" color="text.secondary">
                  {usage.label} ({ingredient.usageCount})
                </Typography>
              </Box>
            )}

            {/* Last Used */}
            {ingredient.lastUsed && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(ingredient.lastUsed).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            )}

            {/* Tags */}
            {ingredient.tags && ingredient.tags.length > 0 && (
              <Box mb={1}>
                {ingredient.tags.slice(0, 2).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
                {ingredient.tags.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{ingredient.tags.length - 2}
                  </Typography>
                )}
              </Box>
            )}

            {/* Actions */}
            <Box>
              <Tooltip title="Modifier">
                <span>
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(ingredient)}
                    disabled={!canEdit}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="Supprimer">
                <span>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onDelete(ingredient)}
                    disabled={!canEdit}
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Preferred Brands */}
      {ingredient.preferredBrands && ingredient.preferredBrands.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Marques préférées: {ingredient.preferredBrands.slice(0, 3).join(', ')}
              {ingredient.preferredBrands.length > 3 && ` +${ingredient.preferredBrands.length - 3} autres`}
            </Typography>
          </Box>
        </>
      )}

      {/* Notes */}
      {ingredient.notes && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Notes: {ingredient.notes}
          </Typography>
        </>
      )}
    </Paper>
  );
}

export default IngredientListItem;
