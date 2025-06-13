/**
 * Simple Map Component using OpenStreetMap
 * Displays sellers and user location with markers
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import {
  LocationOn,
  Store,
  MyLocation
} from '@mui/icons-material';
import { SELLER_THEME } from '../../types/seller';

// Simple map implementation without external dependencies
function SimpleMap({ 
  sellers = [], 
  userLocation = null, 
  onSellerClick = null,
  height = 400,
  showUserLocation = true 
}) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // For now, we'll create a simple static map representation
  // In a real implementation, you would integrate with Leaflet or similar
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSellerClick = (seller) => {
    if (onSellerClick) {
      onSellerClick(seller);
    }
  };

  if (mapError) {
    return (
      <Alert severity="error">
        Erreur lors du chargement de la carte: {mapError}
      </Alert>
    );
  }

  if (!mapLoaded) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 2
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de la carte...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height, position: 'relative' }}>
      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: '#e8f5e8',
          borderRadius: 2,
          border: '2px solid #ddd',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(46, 125, 50, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(139, 195, 74, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Map Grid Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3
          }}
        />

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                border: '3px solid white',
                boxShadow: 2
              }}
            >
              <MyLocation />
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                mt: 0.5,
                bgcolor: 'white',
                px: 1,
                borderRadius: 1,
                boxShadow: 1,
                whiteSpace: 'nowrap'
              }}
            >
              Votre position
            </Typography>
          </Box>
        )}

        {/* Seller Markers */}
        {sellers.map((seller, index) => {
          // Calculate pseudo-random positions around the center
          const angle = (index * 137.5) % 360; // Golden angle for distribution
          const radius = 80 + (index % 3) * 40; // Varying distances
          const x = 50 + (radius * Math.cos(angle * Math.PI / 180)) / 4;
          const y = 50 + (radius * Math.sin(angle * Math.PI / 180)) / 4;

          return (
            <Box
              key={seller.id}
              sx={{
                position: 'absolute',
                top: `${Math.max(10, Math.min(90, y))}%`,
                left: `${Math.max(10, Math.min(90, x))}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: 5
              }}
              onClick={() => handleSellerClick(seller)}
            >
              <Avatar
                src={seller.logoUrl}
                sx={{
                  bgcolor: SELLER_THEME.primary,
                  width: 36,
                  height: 36,
                  border: '2px solid white',
                  boxShadow: 2,
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s'
                  }
                }}
              >
                <Store />
              </Avatar>
              
              {/* Seller Info Popup on Hover */}
              <Card
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  mt: 1,
                  minWidth: 200,
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s',
                  zIndex: 20,
                  '.MuiAvatar-root:hover + &': {
                    opacity: 1,
                    pointerEvents: 'auto'
                  },
                  '&:hover': {
                    opacity: 1,
                    pointerEvents: 'auto'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {seller.shopName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {seller.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<LocationOn />}
                      label={`${seller.location?.deliveryRadius || 5}km`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {seller.settings?.acceptsDelivery && (
                      <Chip
                        label="Livraison"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}

        {/* Map Legend */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            bgcolor: 'white',
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
            minWidth: 150
          }}
        >
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            Légende
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 20, height: 20 }}>
              <MyLocation sx={{ fontSize: 12 }} />
            </Avatar>
            <Typography variant="caption">Votre position</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: SELLER_THEME.primary, width: 20, height: 20 }}>
              <Store sx={{ fontSize: 12 }} />
            </Avatar>
            <Typography variant="caption">Vendeurs ({sellers.length})</Typography>
          </Box>
        </Box>

        {/* Map Info */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'white',
            p: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Carte interactive simplifiée
          </Typography>
        </Box>
      </Box>

      {/* No Sellers Message */}
      {sellers.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Store sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun vendeur dans cette zone
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Élargissez votre zone de recherche
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SimpleMap;
