/**
 * Chatbot Panel Component for MiamBidi
 * Main chat interface with slide-out panel design
 */

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Slide,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Close,
  Minimize,
  OpenInFull,
  Send,
  SmartToy,
  Person,
  Clear,
  QuestionAnswer
} from '@mui/icons-material';

function ChatbotPanel({
  isOpen,
  onClose,
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  isTyping,
  isLoading,
  error,
  messagesEndRef,
  chatContainerRef,
  quickActions,
  onClearConversation
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleQuickAction = (action) => {
    onInputChange(action);
    // Auto-submit quick actions
    const fakeEvent = { preventDefault: () => {} };
    onSubmit(fakeEvent);
  };

  // Dragging functionality for minimized chat (Mouse and Touch support)
  const handleStart = (e) => {
    if (!isMinimized) return;
    e.preventDefault();
    setIsDragging(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setDragStart({
      x: clientX - position.right,
      y: clientY - position.top
    });
  };

  const handleMove = (e) => {
    if (!isDragging || !isMinimized) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const newRight = clientX - dragStart.x;
    const newTop = clientY - dragStart.y;

    // Constrain to viewport bounds with mobile considerations
    const chatWidth = window.innerWidth < 600 ? window.innerWidth : 400;
    const maxRight = window.innerWidth - chatWidth;
    const maxTop = window.innerHeight - 60; // Header height

    setPosition({
      right: Math.max(0, Math.min(maxRight, newRight)),
      top: Math.max(0, Math.min(maxTop, newTop))
    });
  };

  const handleEnd = (e) => {
    if (!isDragging || !isMinimized) return;
    setIsDragging(false);

    // Get final position for snapping
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const { innerWidth, innerHeight } = window;

    // Adjust for mobile
    const chatWidth = innerWidth < 600 ? innerWidth : 400;

    const corners = [
      { top: 0, right: 0 }, // Top-right
      { top: 0, right: innerWidth - chatWidth }, // Top-left
      { top: innerHeight - 60, right: 0 }, // Bottom-right
      { top: innerHeight - 60, right: innerWidth - chatWidth } // Bottom-left
    ];

    // Find nearest corner
    let nearestCorner = corners[0];
    let minDistance = Infinity;

    corners.forEach(corner => {
      const distance = Math.sqrt(
        Math.pow(clientX - (innerWidth - corner.right), 2) +
        Math.pow(clientY - corner.top, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCorner = corner;
      }
    });

    setPosition(nearestCorner);
  };

  // Add global mouse and touch event listeners
  React.useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dragStart, position]);

  const formatMessageContent = (content) => {
    // Process markdown formatting and line breaks
    return content.split('\n').map((line, lineIndex) => {
      // Process bold text (*text* -> <strong>text</strong>)
      const parts = [];
      let currentIndex = 0;
      let partIndex = 0;

      // Find all bold patterns in the line
      const boldPattern = /\*([^*]+)\*/g;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        // Add text before the bold part
        if (match.index > currentIndex) {
          parts.push(
            <span key={`${lineIndex}-${partIndex++}`}>
              {line.substring(currentIndex, match.index)}
            </span>
          );
        }

        // Add the bold part
        parts.push(
          <strong key={`${lineIndex}-${partIndex++}`} style={{ fontWeight: 600 }}>
            {match[1]}
          </strong>
        );

        currentIndex = match.index + match[0].length;
      }

      // Add remaining text after the last bold part
      if (currentIndex < line.length) {
        parts.push(
          <span key={`${lineIndex}-${partIndex++}`}>
            {line.substring(currentIndex)}
          </span>
        );
      }

      // If no bold formatting found, return the line as is
      if (parts.length === 0) {
        parts.push(<span key={`${lineIndex}-0`}>{line}</span>);
      }

      return (
        <React.Fragment key={lineIndex}>
          {parts}
          {lineIndex < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: isMinimized ? position.top : 0,
          right: isMinimized ? position.right : 0,
          width: { xs: '100vw', sm: '400px' },
          height: isMinimized ? '60px' : '100vh',
          zIndex: 1400,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: '16px 0 0 16px' },
          overflow: 'hidden',
          transition: isMinimized ? 'none' : 'all 0.3s ease-out',
          cursor: isMinimized ? 'move' : 'default',
          ...(isDragging && {
            userSelect: 'none',
            pointerEvents: 'auto'
          })
        }}
      >
        {/* Header - Orange Theme with Dragging Support */}
        <Box
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          sx={{
            p: 2,
            bgcolor: '#FF6B35', // Orange background
            color: 'white', // White text for high contrast
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '60px',
            transition: 'all 0.3s ease-in-out',
            cursor: isMinimized ? 'move' : 'default',
            userSelect: 'none',
            touchAction: isMinimized ? 'none' : 'auto' // Prevent default touch behaviors when dragging
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: '#2E7D32', width: 32, height: 32 }}> {/* Keep AI avatar green for brand consistency */}
              <SmartToy fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                Assistant Culinaire MiamBidi
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, color: 'white' }}>
                {isTyping ? 'En train d\'écrire...' : 'En ligne'}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Tooltip title={isMinimized ? "Agrandir" : "Réduire"}>
              <IconButton
                size="small"
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  // Reset position when expanding
                  if (isMinimized) {
                    setPosition({ top: 0, right: 0 });
                  }
                }}
                sx={{ color: 'white', mr: 1 }}
              >
                {isMinimized ? <OpenInFull /> : <Minimize />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Fermer">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'white' }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Error Alert */}
            {error && (
              <Alert severity="warning" sx={{ m: 1 }}>
                {error}
              </Alert>
            )}

            {/* Messages Container */}
            <Box
              ref={chatContainerRef}
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#f5f5f5'
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={message.id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      maxWidth: '85%',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: message.role === 'user' ? '#FF6B35' : '#2E7D32', // Orange for user, green for AI
                        fontSize: '0.8rem'
                      }}
                    >
                      {message.role === 'user' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                    </Avatar>
                    
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: message.role === 'user' ? '#FFE5DB' : 'white', // Orange-tinted background for user messages
                        borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        border: message.isError ? '1px solid #ff9800' : message.role === 'user' ? '1px solid #FF6B35' : 'none',
                        animation: 'fadeIn 0.3s ease-in',
                        '@keyframes fadeIn': {
                          from: { opacity: 0, transform: 'translateY(10px)' },
                          to: { opacity: 1, transform: 'translateY(0)' }
                        }
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: message.role === 'user' ? '#D84315' : '#333', // Orange text for user messages
                          lineHeight: 1.4,
                          whiteSpace: 'pre-wrap',
                          fontWeight: message.role === 'user' ? 500 : 400
                        }}
                      >
                        {formatMessageContent(message.content)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5,
                          textAlign: message.role === 'user' ? 'right' : 'left'
                        }}
                      >
                        {getMessageTime(message.timestamp)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ))}

              {/* Typing Indicator - Enhanced with animated dots */}
              {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#2E7D32' }}>
                      <SmartToy fontSize="small" />
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: '16px 16px 16px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {/* Animated typing dots */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {[0, 1, 2].map((index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: '#2E7D32',
                              animation: 'typingDots 1.5s infinite',
                              animationDelay: `${index * 0.2}s`,
                              '@keyframes typingDots': {
                                '0%, 60%, 100%': {
                                  opacity: 0.3,
                                  transform: 'scale(0.8)'
                                },
                                '30%': {
                                  opacity: 1,
                                  transform: 'scale(1)'
                                }
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Actions */}
            {quickActions && quickActions.length > 0 && (
              <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Suggestions rapides:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {quickActions.slice(0, 3).map((action, index) => (
                    <Chip
                      key={index}
                      label={action}
                      size="small"
                      onClick={() => handleQuickAction(action)}
                      sx={{
                        fontSize: '0.7rem',
                        height: '24px',
                        '&:hover': { bgcolor: '#e8f5e8' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={onClearConversation}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Effacer
                </Button>
                <Button
                  size="small"
                  startIcon={<QuestionAnswer />}
                  onClick={() => handleQuickAction("Comment utiliser l'application ?")}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Aide
                </Button>
              </Box>
              
              <form onSubmit={onSubmit}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tapez votre message..."
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    disabled={isLoading}
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px'
                      }
                    }}
                  />
                  <IconButton
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    sx={{
                      bgcolor: '#FF6B35', // Orange send button
                      color: 'white',
                      '&:hover': { bgcolor: '#E55A2B' },
                      '&:disabled': { bgcolor: 'grey.300' },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send />}
                  </IconButton>
                </Box>
              </form>
            </Box>
          </>
        )}
      </Paper>
    </Slide>
  );
}

export default ChatbotPanel;
