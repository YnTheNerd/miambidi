/**
 * Unit Equivalence Display Component for MiamBidi
 * Shows unit conversions and equivalences for ingredients
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button
} from '@mui/material';
import {
  SwapHoriz,
  ExpandMore,
  ExpandLess,
  Info,
  Scale,
  LocalDining
} from '@mui/icons-material';
import { findEquivalence, getAllEquivalences, canConvert } from '../../utils/unitEquivalence';

function UnitEquivalenceDisplay({ 
  ingredientName, 
  quantity, 
  unit, 
  targetUnit = null,
  showAllEquivalences = false,
  compact = false 
}) {
  const [expanded, setExpanded] = useState(false);
  const [showConversions, setShowConversions] = useState(false);

  if (!ingredientName || !quantity || !unit) {
    return null;
  }

  // Get specific conversion if target unit is provided
  const specificConversion = targetUnit ? 
    findEquivalence(ingredientName, quantity, unit, targetUnit) : null;

  // Get all available equivalences for this ingredient
  const allEquivalences = getAllEquivalences(ingredientName);

  // Check if any conversions are available
  const hasEquivalences = allEquivalences.length > 0;

  if (!hasEquivalences && !specificConversion) {
    return null;
  }

  // Render specific conversion
  if (specificConversion && !showAllEquivalences) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          icon={<SwapHoriz />}
          label={`≈ ${specificConversion.quantity} ${specificConversion.unit}`}
          color={specificConversion.confidence === 'exact' ? 'success' : 'warning'}
          size={compact ? 'small' : 'medium'}
          variant="outlined"
        />
        {specificConversion.isApproximate && (
          <Tooltip title={specificConversion.description}>
            <Info color="action" fontSize="small" />
          </Tooltip>
        )}
      </Box>
    );
  }

  // Render equivalences list
  return (
    <Box sx={{ mt: 1 }}>
      {/* Toggle Button */}
      <Button
        size="small"
        startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        onClick={() => setExpanded(!expanded)}
        sx={{ mb: 1 }}
      >
        Équivalences disponibles ({allEquivalences.length})
      </Button>

      {/* Equivalences List */}
      <Collapse in={expanded}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Conversions approximatives pour <strong>{ingredientName}</strong>
          </Typography>
        </Alert>

        <List dense>
          {allEquivalences.map((equiv, index) => {
            const conversion = findEquivalence(ingredientName, quantity, unit, equiv.unit);
            
            if (!conversion || equiv.unit === unit) return null;

            return (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  {equiv.weight ? <Scale fontSize="small" /> : <LocalDining fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {quantity} {unit} ≈ <strong>{conversion.quantity} {conversion.unit}</strong>
                      </Typography>
                      <Chip
                        label={conversion.confidence === 'exact' ? 'Exact' : 'Approximatif'}
                        size="small"
                        color={conversion.confidence === 'exact' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={conversion.description}
                />
              </ListItem>
            );
          })}
        </List>

        {/* Conversion Calculator */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Calculateur de Conversion
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => setShowConversions(!showConversions)}
          >
            {showConversions ? 'Masquer' : 'Afficher'} le calculateur
          </Button>
          
          <Collapse in={showConversions}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fonctionnalité de conversion interactive à venir...
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Collapse>
    </Box>
  );
}

/**
 * Simple equivalence chip for inline display
 */
export function EquivalenceChip({ ingredientName, quantity, unit, targetUnit, ...props }) {
  const conversion = findEquivalence(ingredientName, quantity, unit, targetUnit);
  
  if (!conversion) return null;

  return (
    <Tooltip title={conversion.description}>
      <Chip
        icon={<SwapHoriz />}
        label={`≈ ${conversion.quantity} ${conversion.unit}`}
        color={conversion.confidence === 'exact' ? 'success' : 'warning'}
        size="small"
        variant="outlined"
        {...props}
      />
    </Tooltip>
  );
}

/**
 * Availability indicator with unit conversion
 */
export function IngredientAvailabilityChip({ 
  ingredientName, 
  requiredQuantity, 
  requiredUnit, 
  availableQuantity, 
  availableUnit 
}) {
  // Try to convert available quantity to required unit
  const conversion = findEquivalence(ingredientName, availableQuantity, availableUnit, requiredUnit);
  
  let isAvailable = false;
  let displayText = '';
  let color = 'error';
  
  if (conversion) {
    isAvailable = conversion.quantity >= requiredQuantity;
    displayText = isAvailable ? 'Disponible' : 'Insuffisant';
    color = isAvailable ? 'success' : 'warning';
  } else if (availableUnit === requiredUnit) {
    isAvailable = availableQuantity >= requiredQuantity;
    displayText = isAvailable ? 'Disponible' : 'Insuffisant';
    color = isAvailable ? 'success' : 'warning';
  } else {
    displayText = 'Unité différente';
    color = 'info';
  }

  const tooltipText = conversion 
    ? `Disponible: ${availableQuantity} ${availableUnit} ≈ ${conversion.quantity} ${conversion.unit}`
    : `Disponible: ${availableQuantity} ${availableUnit}`;

  return (
    <Tooltip title={tooltipText}>
      <Chip
        label={displayText}
        color={color}
        size="small"
        variant={isAvailable ? 'filled' : 'outlined'}
      />
    </Tooltip>
  );
}

/**
 * Unit suggestion component for ingredient input
 */
export function UnitSuggestions({ ingredientName, onUnitSelect }) {
  const equivalences = getAllEquivalences(ingredientName);
  
  if (equivalences.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Unités suggérées pour {ingredientName}:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
        {equivalences.map((equiv, index) => (
          <Chip
            key={index}
            label={equiv.unit}
            size="small"
            variant="outlined"
            clickable
            onClick={() => onUnitSelect && onUnitSelect(equiv.unit)}
            sx={{ fontSize: '0.75rem' }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default UnitEquivalenceDisplay;
