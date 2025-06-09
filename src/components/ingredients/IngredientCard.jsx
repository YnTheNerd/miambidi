/**
 * IngredientCard Component for MiamBidi
 * Displays ingredient information in a card format
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Badge
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

function IngredientCard({ 
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
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      {/* Header with visibility indicator */}
      <Box sx={{ position: 'relative' }}>
        {ingredient.isPublic && (
          <Chip
            icon={<Public />}
            label="Public"
            size="small"
            color="info"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 1 
            }}
          />
        )}
        
        {!ingredient.isPublic && (
          <Chip
            icon={<Lock />}
            label="Famille"
            size="small"
            color="default"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 1 
            }}
          />
        )}

        {isRecent && (
          <Chip
            label="Nouveau"
            size="small"
            color="secondary"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              left: 8, 
              zIndex: 1 
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: isRecent || ingredient.isPublic ? 5 : 2 }}>
        {/* Ingredient Avatar */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: `${getCategoryColor(ingredient.category)}.main`,
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            <Restaurant />
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" component="h3" gutterBottom>
              {ingredient.name}
            </Typography>
            <Chip 
              label={ingredient.category} 
              size="small" 
              color={getCategoryColor(ingredient.category)}
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Description */}
        {ingredient.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.5em'
            }}
          >
            {ingredient.description}
          </Typography>
        )}

        {/* Price and Unit */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            {formatPrice(ingredient.price)}
          </Typography>
          <Chip 
            label={`par ${ingredient.unit}`} 
            size="small" 
            variant="outlined" 
          />
        </Box>

        {/* Usage Statistics */}
        {ingredient.usageCount > 0 && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <TrendingUp 
              fontSize="small" 
              color={usage.color}
            />
            <Typography variant="caption" color="text.secondary">
              {usage.label} ({ingredient.usageCount} fois)
            </Typography>
          </Box>
        )}

        {/* Last Used */}
        {ingredient.lastUsed && (
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Utilisé le {new Date(ingredient.lastUsed).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
        )}

        {/* Tags */}
        {ingredient.tags && ingredient.tags.length > 0 && (
          <Box mt={1}>
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
                +{ingredient.tags.length - 2} autres
              </Typography>
            )}
          </Box>
        )}

        {/* Aliases */}
        {ingredient.aliases && ingredient.aliases.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Aussi appelé: {ingredient.aliases.slice(0, 2).join(', ')}
              {ingredient.aliases.length > 2 && '...'}
            </Typography>
          </Box>
        )}

        {/* Storage Instructions */}
        {ingredient.storageInstructions && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Conservation: {ingredient.storageInstructions}
            </Typography>
          </Box>
        )}

        {/* Seasonality */}
        {ingredient.seasonality && ingredient.seasonality.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Saison: {ingredient.seasonality.join(', ')}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          {ingredient.averageShelfLife && (
            <Tooltip title={`Durée de conservation: ${ingredient.averageShelfLife} jours`}>
              <Chip
                icon={<Schedule />}
                label={`${ingredient.averageShelfLife}j`}
                size="small"
                variant="outlined"
                color="info"
              />
            </Tooltip>
          )}
        </Box>

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
      </CardActions>

      {/* Usage Badge */}
      {ingredient.usageCount > 0 && (
        <Badge
          badgeContent={ingredient.usageCount}
          color={usage.color}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              minWidth: '20px',
              height: '20px'
            }
          }}
        >
          <TrendingUp fontSize="small" />
        </Badge>
      )}
    </Card>
  );
}

export default IngredientCard;
