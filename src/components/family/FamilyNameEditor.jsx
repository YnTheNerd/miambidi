import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Fade,
  Alert
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Check
} from '@mui/icons-material';

function FamilyNameEditor({ familyName, isAdmin, onUpdateName, onAlert }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(familyName);
  const [error, setError] = useState('');

  const handleStartEdit = () => {
    setEditedName(familyName);
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditedName(familyName);
    setIsEditing(false);
    setError('');
  };

  const handleSave = () => {
    const trimmedName = editedName.trim();
    
    if (!trimmedName) {
      setError('Family name cannot be empty');
      return;
    }

    if (trimmedName === familyName) {
      setIsEditing(false);
      return;
    }

    try {
      onUpdateName(trimmedName);
      setIsEditing(false);
      setError('');
      onAlert({ type: 'success', message: 'Family name updated successfully!' });
    } catch (error) {
      setError(error.message);
      onAlert({ type: 'error', message: error.message });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5" component="h1">
          {familyName}
        </Typography>
        {isAdmin && (
          <Tooltip title="Edit family name">
            <IconButton
              size="small"
              onClick={handleStartEdit}
              sx={{ 
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: error ? 1 : 0 }}>
        <TextField
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onKeyDown={handleKeyPress}
          variant="outlined"
          size="small"
          autoFocus
          error={!!error}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.5rem',
              fontWeight: 400,
            }
          }}
        />
        <Tooltip title="Save changes">
          <IconButton
            size="small"
            onClick={handleSave}
            color="primary"
            disabled={!editedName.trim()}
          >
            <Save fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel editing">
          <IconButton
            size="small"
            onClick={handleCancelEdit}
            color="default"
          >
            <Cancel fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        </Fade>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Press Enter to save, Escape to cancel
      </Typography>
    </Box>
  );
}

export default FamilyNameEditor;
