/**
 * Enhanced App Layout Component
 * Optimized performance with smooth animations and consistent spacing
 */

import React, { memo } from 'react';
import { Box, Toolbar, Container, Fade } from '@mui/material';
import Navigation from './Navigation';
import ChatbotContainer from '../chatbot/ChatbotContainer';

const AppLayout = memo(({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          // Performance optimization: use transform instead of margin for better rendering
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: 'transform', // Hint to browser for optimization
          // Smooth transitions for layout changes
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          // Consistent overflow handling
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <Toolbar />

        {/* Enhanced content container with fade-in animation */}
        <Fade in={true} timeout={300}>
          <Container
            maxWidth="xl"
            sx={{
              py: 3,
              px: { xs: 2, sm: 3 },
              // Consistent spacing and responsive design
              minHeight: 'calc(100vh - 64px)', // Account for toolbar height
              display: 'flex',
              flexDirection: 'column',
              // Smooth content transitions
              '& > *': {
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            }}
          >
            {children}
          </Container>
        </Fade>
      </Box>

      {/* Chatbot - Available on all protected pages */}
      <ChatbotContainer />
    </Box>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;
