import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function TestCalendar() {
  console.log('TestCalendar rendering...');
  
  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" gutterBottom>
        Test Calendar Component
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          This is a test to verify basic rendering works
        </Typography>
      </Paper>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1,
        bgcolor: 'white',
        p: 2,
        borderRadius: 1
      }}>
        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
          <Paper key={day} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{day}</Typography>
            <Box sx={{ mt: 1 }}>
              {['Petit-déjeuner', 'Déjeuner', 'Dîner'].map((meal) => (
                <Paper 
                  key={meal} 
                  sx={{ 
                    p: 1, 
                    mb: 1, 
                    bgcolor: 'grey.100',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption">{meal}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default TestCalendar;
