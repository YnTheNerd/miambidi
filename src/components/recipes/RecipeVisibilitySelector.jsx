import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Lock,
  Group,
  Public,
  Info
} from '@mui/icons-material';

/**
 * RecipeVisibilitySelector Component
 * Allows users to select recipe visibility level (private, family, public)
 */
function RecipeVisibilitySelector({ value, onChange, disabled = false }) {
  const visibilityOptions = [
    {
      value: 'family',
      label: 'Famille',
      icon: <Group />,
      description: 'Visible par tous les membres de votre famille',
      color: 'primary.main',
      details: 'Partagé avec votre famille uniquement. Idéal pour vos recettes familiales favorites.'
    },
    {
      value: 'private',
      label: 'Privé (Personnel)',
      icon: <Lock />,
      description: 'Visible uniquement par vous',
      color: 'warning.main',
      details: 'Recette personnelle que vous seul pouvez voir. Parfait pour vos créations secrètes.'
    },
    {
      value: 'public',
      label: 'Public',
      icon: <Public />,
      description: 'Visible par toute la communauté MiamBidi',
      color: 'success.main',
      details: 'Partagé avec tous les utilisateurs MiamBidi. Contribuez à la communauté culinaire!'
    }
  ];

  return (
    <Box>
      <FormControl component="fieldset" fullWidth disabled={disabled}>
        <FormLabel 
          component="legend" 
          sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: 'text.primary',
            '&.Mui-focused': {
              color: 'primary.main'
            }
          }}
        >
          Visibilité de la Recette
        </FormLabel>
        
        <RadioGroup
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ gap: 1 }}
        >
          {visibilityOptions.map((option) => (
            <Tooltip
              key={option.value}
              title={option.details}
              arrow
              placement="right"
            >
              <Paper
                elevation={value === option.value ? 2 : 0}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: value === option.value ? option.color : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    borderColor: disabled ? 'divider' : option.color,
                    backgroundColor: disabled ? 'inherit' : 'action.hover'
                  }
                }}
                onClick={() => !disabled && onChange(option.value)}
              >
                <FormControlLabel
                  value={option.value}
                  control={
                    <Radio
                      sx={{
                        color: option.color,
                        '&.Mui-checked': {
                          color: option.color
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box
                        sx={{
                          color: value === option.value ? option.color : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {option.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: value === option.value ? 600 : 500,
                            color: value === option.value ? option.color : 'text.primary'
                          }}
                        >
                          {option.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mt: 0.5
                          }}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                      <Tooltip title="Plus d'informations" arrow>
                        <Info
                          sx={{
                            color: 'text.secondary',
                            fontSize: 18,
                            opacity: 0.7
                          }}
                        />
                      </Tooltip>
                    </Box>
                  }
                  sx={{
                    margin: 0,
                    width: '100%',
                    '& .MuiFormControlLabel-label': {
                      width: '100%'
                    }
                  }}
                />
              </Paper>
            </Tooltip>
          ))}
        </RadioGroup>
      </FormControl>

      {/* Additional Information */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'info.light',
          borderRadius: 1,
          border: 1,
          borderColor: 'info.main'
        }}
      >
        <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 500 }}>
          💡 Conseil :
        </Typography>
        <Typography variant="body2" sx={{ color: 'info.dark', mt: 0.5 }}>
          Vous pourrez modifier la visibilité de votre recette à tout moment après sa création.
          Les recettes familiales sont parfaites pour partager vos traditions culinaires !
        </Typography>
      </Box>
    </Box>
  );
}

export default RecipeVisibilitySelector;
