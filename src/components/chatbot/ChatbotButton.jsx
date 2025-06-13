/**
 * Chatbot Button Component for MiamBidi
 * Floating action button to open/close the chatbot
 */

import React from 'react';
import {
  Fab,
  Badge,
  Zoom,
  Tooltip,
  Box
} from '@mui/material';
import {
  Chat,
  Close,
  SmartToy,
  Restaurant
} from '@mui/icons-material';

function ChatbotButton({
  isOpen,
  onClick,
  hasNewMessage = false,
  isTyping = false,
  disabled = false
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 88, // Moved up to avoid overlapping with FABs
        right: 24,
        zIndex: 1300, // Above most MUI components
        '& .MuiFab-root': {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 8px 25px rgba(46, 125, 50, 0.3)'
          }
        }
      }}
    >
      <Zoom in={true} timeout={300}>
        <Tooltip
          title={isOpen ? "Fermer l'assistant" : "Assistant Culinaire MiamBidi"}
          placement="left"
          arrow
        >
          <Box component="span">
            <Badge
              badgeContent={hasNewMessage ? "!" : 0}
              color="error"
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Fab
                color="primary"
                size="large"
                onClick={onClick}
                disabled={disabled}
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#FF6B35', // Attention-grabbing orange
                color: 'white',
                '&:hover': {
                  bgcolor: '#E55A2B',
                  transform: 'scale(1.1)'
                },
                '&:disabled': {
                  bgcolor: 'grey.400',
                  color: 'grey.600'
                },
                // Pulsing animation when typing with orange theme
                ...(isTyping && {
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.7)'
                    },
                    '70%': {
                      boxShadow: '0 0 0 10px rgba(255, 107, 53, 0)'
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)'
                    }
                  }
                }),
                // Smooth transitions
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {isOpen ? (
                <Close sx={{ fontSize: 28 }} />
              ) : isTyping ? (
                <SmartToy sx={{ fontSize: 28 }} />
              ) : (
                <Restaurant sx={{ fontSize: 28 }} /> // Chef robot icon
              )}
              </Fab>
            </Badge>
          </Box>
        </Tooltip>
      </Zoom>
    </Box>
  );
}

export default ChatbotButton;
