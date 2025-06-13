/**
 * Editable Instruction List Component for MiamBidi
 * Provides inline editing functionality for recipe instructions
 */

import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
  Tooltip,
  Button,
  Grid,
  Alert
} from '@mui/material';
import {
  Edit,
  Delete,
  Save,
  Cancel,
  Add,
  DragIndicator,
  CheckCircle
} from '@mui/icons-material';

function EditableInstructionList({
  instructions = [],
  onInstructionsChange,
  newInstruction = '',
  onNewInstructionChange,
  onAddInstruction,
  error = '',
  readOnly = false,
  showAddForm = true
}) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingText, setEditingText] = useState('');
  const [modifiedInstructions, setModifiedInstructions] = useState(new Set());

  const handleStartEdit = (index) => {
    if (readOnly) return;
    setEditingIndex(index);
    setEditingText(instructions[index]);
  };

  const handleSaveEdit = () => {
    if (editingText.trim().length < 10) {
      return; // Don't save if too short
    }

    const updatedInstructions = [...instructions];
    updatedInstructions[editingIndex] = editingText.trim();
    
    // Mark as modified
    const newModified = new Set(modifiedInstructions);
    newModified.add(editingIndex);
    setModifiedInstructions(newModified);
    
    onInstructionsChange(updatedInstructions);
    setEditingIndex(-1);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditingText('');
  };

  const handleDeleteInstruction = (index) => {
    if (readOnly) return;
    const updatedInstructions = instructions.filter((_, i) => i !== index);
    
    // Update modified indices
    const newModified = new Set();
    modifiedInstructions.forEach(modIndex => {
      if (modIndex < index) {
        newModified.add(modIndex);
      } else if (modIndex > index) {
        newModified.add(modIndex - 1);
      }
    });
    setModifiedInstructions(newModified);
    
    onInstructionsChange(updatedInstructions);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Box>
      {/* Instructions Section Header */}
      <Typography variant="h6" gutterBottom>
        Instructions
        {instructions.length > 0 && (
          <Chip 
            label={`${instructions.length} étape${instructions.length > 1 ? 's' : ''}`}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Add New Instruction Form */}
      {showAddForm && !readOnly && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={11}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Nouvelle instruction"
              value={newInstruction}
              onChange={(e) => onNewInstructionChange(e.target.value)}
              placeholder="Décrivez une étape de la préparation (minimum 10 caractères)..."
              helperText={`${newInstruction.length}/10 caractères minimum`}
              error={newInstruction.length > 0 && newInstruction.length < 10}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onAddInstruction}
              sx={{ height: '80px' }}
              disabled={newInstruction.trim().length < 10}
            >
              <Add />
            </Button>
          </Grid>
        </Grid>
      )}

      {/* Instructions List */}
      {instructions.length > 0 && (
        <List sx={{ mb: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
          {instructions.map((instruction, index) => (
            <ListItem 
              key={index}
              sx={{
                border: modifiedInstructions.has(index) ? '2px solid #4caf50' : 'none',
                borderRadius: modifiedInstructions.has(index) ? 1 : 0,
                mb: modifiedInstructions.has(index) ? 1 : 0,
                bgcolor: modifiedInstructions.has(index) ? '#e8f5e8' : 'transparent'
              }}
            >
              {/* Drag Handle (for future drag-and-drop functionality) */}
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <DragIndicator color="action" fontSize="small" />
              </Box>

              {editingIndex === index ? (
                // Edit Mode
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoFocus
                    error={editingText.trim().length < 10}
                    helperText={
                      editingText.trim().length < 10 
                        ? `Minimum 10 caractères (${editingText.length}/10)`
                        : `${editingText.length} caractères`
                    }
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveEdit}
                      disabled={editingText.trim().length < 10}
                    >
                      Sauvegarder
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                    >
                      Annuler
                    </Button>
                  </Box>
                </Box>
              ) : (
                // View Mode
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        Étape {index + 1}
                      </Typography>
                      {modifiedInstructions.has(index) && (
                        <Tooltip title="Instruction modifiée">
                          <CheckCircle color="success" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {instruction}
                    </Typography>
                  }
                />
              )}

              {/* Action Buttons */}
              {!readOnly && editingIndex !== index && (
                <ListItemSecondaryAction>
                  <Tooltip title="Modifier cette instruction">
                    <IconButton
                      edge="end"
                      onClick={() => handleStartEdit(index)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer cette instruction">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteInstruction(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Empty State */}
      {instructions.length === 0 && !readOnly && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Aucune instruction ajoutée. Commencez par ajouter la première étape de votre recette.
          </Typography>
        </Box>
      )}

      {/* Help Text */}
      {!readOnly && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          💡 Astuce: Cliquez sur l'icône d'édition pour modifier une instruction. 
          Utilisez Ctrl+Entrée pour sauvegarder rapidement.
        </Typography>
      )}
    </Box>
  );
}

export default EditableInstructionList;
