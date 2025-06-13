/**
 * Fallback Map Component for MiamBidi
 * Used when Google Maps API is not available or fails to load
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Store,
  LocationOn,
  LocalShipping,
  Star,
  Phone,
  Directions,
  MyLocation
} from '@mui/icons-material';
import { SELLER_THEME } from '../../types/seller';

// Default center: Yaoundé, Cameroon
const DEFAULT_CENTER = { lat: 3.8480, lng: 11.5021 };

function FallbackMap({ 
  sellers = [], 
  userLocation = null, 
  onSellerClick = null,
  height = 400,
  showUserLocation = true,
  showSearch = true 
}) {
  const [selectedSeller, setSelectedSeller] = useState(null);

  const handleSellerSelect = (seller) => {
    setSelectedSeller(seller);
    if (onSellerClick) {
      onSellerClick(seller);
    }
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords);
          // In a real implementation, this would update the map center
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const calculateDistance = (seller) => {
    if (!userLocation || !seller.location?.coordinates) {
      return 'Distance inconnue';
    }
    
    // Simple distance calculation (not accurate, just for demo)
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = seller.location.coordinates.lat;
    const lon2 = seller.location.coordinates.lng;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return `${distance.toFixed(1)} km`;
  };

  return (
    <Box sx={{ height, position: 'relative' }}>
      {/* Header with location info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Mode carte simplifiée - Région de Yaoundé
            </Typography>
            <Typography variant="caption">
              Google Maps non disponible. Liste des vendeurs ci-dessous.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleGetUserLocation}
            startIcon={<MyLocation />}
          >
            Ma position
          </Button>
        </Box>
      </Alert>

      {/* Sellers List */}
      <Card sx={{ height: height - 80, overflow: 'auto' }}>
        <CardContent sx={{ p: 0 }}>
          {sellers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Store sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun vendeur trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aucun vendeur disponible dans votre région pour le moment.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sellers.map((seller, index) => (
                <React.Fragment key={seller.id}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'grey.50' },
                      bgcolor: selectedSeller?.id === seller.id ? 'primary.50' : 'transparent'
                    }}
                    onClick={() => handleSellerSelect(seller)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: SELLER_THEME.primary, color: 'black' }}>
                        <Store />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {seller.shopName}
                          </Typography>
                          <Chip
                            icon={<Star />}
                            label={seller.stats?.averageRating?.toFixed(1) || '0.0'}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {seller.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Chip
                              icon={<LocationOn />}
                              label={calculateDistance(seller)}
                              size="small"
                              variant="outlined"
                            />
                            
                            {seller.settings?.acceptsDelivery && (
                              <Chip
                                icon={<LocalShipping />}
                                label="Livraison"
                                size="small"
                                color="success"
                              />
                            )}
                            
                            <Chip
                              label={`Rayon: ${seller.location?.deliveryRadius || 5}km`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSellerSelect(seller);
                              }}
                              sx={{ 
                                bgcolor: SELLER_THEME.primary,
                                color: 'black',
                                '&:hover': { bgcolor: SELLER_THEME.secondary }
                              }}
                            >
                              Sélectionner
                            </Button>
                            
                            {seller.contact?.phone && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${seller.contact.phone}`, '_self');
                                }}
                              >
                                <Phone />
                              </IconButton>
                            )}
                            
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open in external maps app
                                const coords = seller.location?.coordinates;
                                if (coords) {
                                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
                                }
                              }}
                            >
                              <Directions />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {index < sellers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default FallbackMap;
