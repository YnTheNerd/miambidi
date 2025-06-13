/**
 * Dynamic Recipe Grid Component for MiamBidi
 * Implements a masonry-style grid with organic 2-3 column alternation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

function DynamicRecipeGrid({ children, recipes = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Generate dynamic row patterns for organic layout
  const generateRowPatterns = useMemo(() => {
    if (isMobile) {
      // Mobile: Single column
      return recipes.map(() => [1]);
    }

    if (isTablet) {
      // Tablet: Mix of 2-card rows with occasional 3-card rows
      const patterns = [];
      let index = 0;
      
      while (index < recipes.length) {
        // 70% chance for 2-card row, 30% chance for 3-card row
        const use3Cards = Math.random() > 0.7 && (recipes.length - index >= 3);
        const cardsInRow = use3Cards ? 3 : 2;
        
        patterns.push(cardsInRow);
        index += cardsInRow;
      }
      
      return patterns;
    }

    // Desktop: Organic mix of 2-card and 3-card rows
    const patterns = [];
    let index = 0;
    
    while (index < recipes.length) {
      // More varied pattern for desktop
      const remainingCards = recipes.length - index;
      let cardsInRow;
      
      if (remainingCards === 1) {
        cardsInRow = 1;
      } else if (remainingCards === 2) {
        cardsInRow = 2;
      } else {
        // 40% chance for 2-card row, 60% chance for 3-card row
        cardsInRow = Math.random() > 0.4 ? 3 : 2;
      }
      
      patterns.push(cardsInRow);
      index += cardsInRow;
    }
    
    return patterns;
  }, [recipes.length, isMobile, isTablet, isDesktop]);

  // Generate rows with variable widths
  const generateRows = useMemo(() => {
    const rows = [];
    let childIndex = 0;
    
    generateRowPatterns.forEach((cardsInRow, rowIndex) => {
      const rowChildren = [];
      
      for (let i = 0; i < cardsInRow && childIndex < children.length; i++) {
        rowChildren.push({
          child: children[childIndex],
          index: childIndex
        });
        childIndex++;
      }
      
      if (rowChildren.length > 0) {
        rows.push({
          children: rowChildren,
          cardsInRow,
          rowIndex
        });
      }
    });
    
    return rows;
  }, [children, generateRowPatterns]);

  // Calculate card widths based on row configuration
  const getCardWidth = (cardsInRow, cardIndex) => {
    if (isMobile) {
      return '100%';
    }

    if (cardsInRow === 1) {
      return '100%';
    } else if (cardsInRow === 2) {
      // Variable widths for 2-card rows to create organic feel
      const widthVariations = [
        ['48%', '48%'],
        ['45%', '52%'],
        ['52%', '45%'],
        ['50%', '47%']
      ];
      const variation = widthVariations[cardIndex % widthVariations.length];
      return variation[cardIndex] || '48%';
    } else if (cardsInRow === 3) {
      // Variable widths for 3-card rows
      const widthVariations = [
        ['32%', '34%', '32%'],
        ['30%', '38%', '30%'],
        ['34%', '30%', '34%'],
        ['33%', '32%', '33%']
      ];
      const variation = widthVariations[cardIndex % widthVariations.length];
      return variation[cardIndex] || '32%';
    }
    
    return '32%';
  };

  // Enhanced card heights for better content display
  const getCardHeight = (cardsInRow, rowIndex) => {
    const baseHeight = 420; // Increased from 380px for better content display
    
    if (isMobile) {
      return `${baseHeight}px`;
    }
    
    // Add slight height variation for organic feel
    const heightVariations = [0, 10, -5, 15, -10, 5];
    const variation = heightVariations[rowIndex % heightVariations.length];
    
    return `${baseHeight + variation}px`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: {
          xs: 2, // 16px gaps on mobile
          sm: 2.5, // 20px gaps on tablet
          md: 3 // 24px gaps on desktop
        }
      }}
    >
      {generateRows.map((row) => (
        <Box
          key={row.rowIndex}
          sx={{
            display: 'flex',
            gap: {
              xs: 1.5, // 12px gaps between cards on mobile
              sm: 2, // 16px gaps on tablet
              md: 2.5 // 20px gaps on desktop
            },
            justifyContent: row.cardsInRow === 1 ? 'center' : 'space-between',
            alignItems: 'stretch',
            width: '100%',
            // Staggered animation for organic feel
            animation: 'fadeInUp 0.6s ease-out',
            animationDelay: `${row.rowIndex * 0.1}s`,
            animationFillMode: 'both',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          {row.children.map((item, cardIndex) => (
            <Box
              key={item.index}
              sx={{
                width: getCardWidth(row.cardsInRow, cardIndex),
                minHeight: getCardHeight(row.cardsInRow, row.rowIndex),
                display: 'flex',
                flexDirection: 'column',
                // Ensure cards fill their allocated space
                '& > *': {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                },
                // Enhanced hover effects for organic feel
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  zIndex: 1
                }
              }}
            >
              {item.child}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default DynamicRecipeGrid;
