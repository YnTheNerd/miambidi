/**
 * Shopping List Item Component
 * Individual item with completion toggle, notes, and recipe information
 */

import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Typography,
  IconButton,
  Chip,
  TextField,
  Collapse,
  Tooltip,
  Paper
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Edit,
  Save,
  Cancel,
  Restaurant,
  PriorityHigh,
  CheckCircle
} from '@mui/icons-material';
import { formatQuantityUnit } from '../../utils/unitConversion.js';

function ShoppingListItem({ 
  item, 
  category, 
  onToggleCompletion, 
  onUpdateNotes,
  showRecipeInfo = true 
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(item.notes || '');

  const handleToggleCompletion = () => {
    onToggleCompletion(item.id, category, !item.isCompleted);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(item.id, category, notesValue);
    setEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotesValue(item.notes || '');
    setEditingNotes(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <PriorityHigh fontSize="small" />;
      case 'medium': return <Restaurant fontSize="small" />;
      case 'low': return <CheckCircle fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Paper
      elevation={item.isCompleted ? 0 : 1}
      sx={{
        p: 2,
        mb: 1,
        bgcolor: item.isCompleted ? 'grey.100' : 'background.paper',
        opacity: item.isCompleted ? 0.7 : 1,
        transition: 'all 0.2s ease-in-out',
        border: item.isCompleted ? '1px solid #e0e0e0' : 'none',
        '&:hover': {
          elevation: item.isCompleted ? 1 : 2,
          bgcolor: item.isCompleted ? 'grey.200' : 'grey.50'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {/* Completion Checkbox */}
        <Checkbox
          checked={item.isCompleted}
          onChange={handleToggleCompletion}
          color="primary"
          sx={{ mt: -0.5 }}
        />

        {/* Item Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Main Item Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: item.isCompleted ? 'line-through' : 'none',
                fontWeight: item.isCompleted ? 'normal' : 'medium',
                flexGrow: 1
              }}
            >
              {formatQuantityUnit(item.quantity, item.unit)} {item.name}
            </Typography>

            {/* Priority Indicator */}
            <Tooltip title={`Priorité: ${item.priority}`}>
              <Chip
                icon={getPriorityIcon(item.priority)}
                label={item.priority}
                size="small"
                color={getPriorityColor(item.priority)}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Tooltip>

            {/* Expand/Collapse Button */}
            {(showRecipeInfo && item.recipeNames.length > 0) && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ ml: 1 }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>

          {/* Recipe Information */}
          {showRecipeInfo && item.recipeNames.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {item.recipeNames.map((recipeName, index) => (
                <Chip
                  key={index}
                  label={recipeName}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}

          {/* Notes Section */}
          <Box sx={{ mt: 1 }}>
            {editingNotes ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Notes"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Ajouter une note (marque, substitution, etc.)"
                  multiline
                  maxRows={3}
                />
                <IconButton size="small" onClick={handleSaveNotes} color="primary">
                  <Save />
                </IconButton>
                <IconButton size="small" onClick={handleCancelNotes}>
                  <Cancel />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.notes ? (
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    💡 {item.notes}
                  </Typography>
                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.disabled" 
                    sx={{ flexGrow: 1, fontStyle: 'italic' }}
                  >
                    Cliquer pour ajouter une note
                  </Typography>
                )}
                <IconButton 
                  size="small" 
                  onClick={() => setEditingNotes(true)}
                  sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Détails de l'ingrédient
              </Typography>
              
              {/* Original Quantities */}
              {item.sources && item.sources.length > 1 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quantités originales:
                  </Typography>
                  {item.sources.map((source, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                      • {source.recipeName}: {formatQuantityUnit(source.quantity || item.originalQuantity, source.unit || item.originalUnit)}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Meal Information */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Utilisé dans les repas:
                </Typography>
                {item.sources ? item.sources.map((source, index) => (
                  <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                    • {source.mealType} - {new Date(source.date).toLocaleDateString('fr-FR')}
                  </Typography>
                )) : (
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    • {item.recipeNames.join(', ')}
                  </Typography>
                )}
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* Completion Info */}
      {item.isCompleted && item.completedAt && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary">
            ✅ Acheté le {new Date(item.completedAt).toLocaleDateString('fr-FR')} 
            {item.completedBy && ` par ${item.completedBy}`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default ShoppingListItem;
