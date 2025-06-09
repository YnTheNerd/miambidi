/**
 * Category Section Component
 * Groups shopping list items by category with bulk actions
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  IconButton,
  Chip,
  Button,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  ClearAll,
  ShoppingCart
} from '@mui/icons-material';
import { GROCERY_CATEGORIES } from '../../types/shoppingList.js';
import ShoppingListItem from './ShoppingListItem.jsx';

function CategorySection({
  category,
  items,
  onToggleItemCompletion,
  onUpdateItemNotes,
  onToggleCategoryCompletion,
  onClearCompletedInCategory,
  expanded = true,
  onExpandChange
}) {
  const [localExpanded, setLocalExpanded] = useState(expanded);

  const categoryInfo = GROCERY_CATEGORIES[category] || GROCERY_CATEGORIES['Autres'];

  // Calculate completion stats
  const totalItems = items.length;
  const completedItems = items.filter(item => item.isCompleted).length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const allCompleted = totalItems > 0 && completedItems === totalItems;
  const someCompleted = completedItems > 0 && completedItems < totalItems;

  const handleExpandChange = (event, isExpanded) => {
    setLocalExpanded(isExpanded);
    if (onExpandChange) {
      onExpandChange(category, isExpanded);
    }
  };

  const handleToggleAll = () => {
    onToggleCategoryCompletion(category, !allCompleted);
  };

  const handleClearCompleted = () => {
    if (onClearCompletedInCategory) {
      onClearCompletedInCategory(category);
    }
  };

  if (totalItems === 0) {
    return null; // Don't render empty categories
  }

  return (
    <Accordion
      expanded={localExpanded}
      onChange={handleExpandChange}
      sx={{
        mb: 2,
        '&:before': {
          display: 'none',
        },
        boxShadow: 1,
        borderRadius: 2,
        '&.Mui-expanded': {
          margin: '0 0 16px 0',
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'grey.50',
          borderRadius: '8px 8px 0 0',
          '&.Mui-expanded': {
            borderRadius: '8px 8px 0 0',
          },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2
          }
        }}
      >
        {/* Category Icon and Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
            {categoryInfo.icon}
          </Typography>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: categoryInfo.color }}>
              {category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoryInfo.description}
            </Typography>
          </Box>
        </Box>

        {/* Stats and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
          {/* Completion Stats */}
          <Chip
            label={`${completedItems}/${totalItems}`}
            size="small"
            color={allCompleted ? 'success' : someCompleted ? 'warning' : 'default'}
            variant={allCompleted ? 'filled' : 'outlined'}
          />

          {/* Toggle All Button */}
          <Tooltip title={allCompleted ? 'Marquer tout comme non acheté' : 'Marquer tout comme acheté'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAll();
              }}
              color={allCompleted ? 'success' : 'default'}
            >
              {allCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {/* Progress Bar */}
        {totalItems > 0 && (
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progression
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(completionPercentage)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: allCompleted ? 'success.main' : someCompleted ? 'warning.main' : 'primary.main'
                }
              }}
            />
          </Box>
        )}

        {/* Category Actions */}
        {someCompleted && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Button
              size="small"
              startIcon={<ClearAll />}
              onClick={handleClearCompleted}
              color="secondary"
              variant="text"
            >
              Effacer les articles achetés
            </Button>
          </Box>
        )}

        {/* Items List */}
        <Box sx={{ px: 2, pb: 2 }}>
          {items.map((item) => (
            <ShoppingListItem
              key={item.id}
              item={item}
              category={category}
              onToggleCompletion={onToggleItemCompletion}
              onUpdateNotes={onUpdateItemNotes}
              showRecipeInfo={true}
            />
          ))}
        </Box>

        {/* Category Summary */}
        {totalItems > 5 && (
          <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {totalItems} articles dans cette catégorie
              {completedItems > 0 && ` • ${completedItems} achetés`}
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default CategorySection;
