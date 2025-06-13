/**
 * Seller Discovery Component
 * Displays available sellers with location-based filtering and shopping list request functionality
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  LocationOn,
  Store,
  Phone,
  WhatsApp,
  Schedule,
  LocalShipping,
  ShoppingCart,
  Send,
  Star,
  Verified,
  DirectionsWalk,
  DirectionsCar
} from '@mui/icons-material';
import { useSeller } from '../../contexts/SellerContext';
import { useShoppingList } from '../../contexts/ShoppingListContext';
import { useNotification } from '../../contexts/NotificationContext';
import { SELLER_THEME } from '../../types/seller';
import SmartMapWrapper from '../maps/SmartMapWrapper';

function SellerDiscovery({ open, onClose, shoppingListItems = [] }) {
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const { allSellers, findNearbySellers, SellerUtils } = useSeller();
  const { currentShoppingList } = useShoppingList();
  const { showNotification } = useNotification();

  // Get user's current location
  useEffect(() => {
    if (open && !userLocation) {
      setLocationLoading(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            showNotification('Impossible d\'obtenir votre position. Utilisation de la position par défaut.', 'warning');
            // Default to Yaoundé, Cameroon
            setUserLocation({ lat: 3.8480, lng: 11.5021 });
            setLocationLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        showNotification('Géolocalisation non supportée par votre navigateur', 'warning');
        setUserLocation({ lat: 3.8480, lng: 11.5021 });
        setLocationLoading(false);
      }
    }
  }, [open, userLocation, showNotification]);

  // Get nearby sellers
  const nearbySellers = userLocation ? findNearbySellers(userLocation, 20) : allSellers;

  const handleSellerToggle = (sellerId) => {
    setSelectedSellers(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSendRequests = async () => {
    if (selectedSellers.length === 0) {
      showNotification('Veuillez sélectionner au moins un vendeur', 'warning');
      return;
    }

    if (!shoppingListItems || shoppingListItems.length === 0) {
      showNotification('Aucun article dans la liste de courses', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Here we would implement the actual request sending logic
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification(
        `Demandes envoyées à ${selectedSellers.length} vendeur(s) avec succès`,
        'success'
      );
      
      onClose();
      setSelectedSellers([]);
      setRequestMessage('');
    } catch (error) {
      console.error('Error sending requests:', error);
      showNotification('Erreur lors de l\'envoi des demandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (seller) => {
    if (!userLocation || !seller.location?.coordinates) return 'Distance inconnue';
    
    const distance = SellerUtils.calculateDistance(
      userLocation.lat,
      userLocation.lng,
      seller.location.coordinates.lat,
      seller.location.coordinates.lng
    );
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const getDeliveryIcon = (distance) => {
    const numDistance = parseFloat(distance);
    return numDistance <= 2 ? <DirectionsWalk /> : <DirectionsCar />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: SELLER_THEME.primary, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Store />
        Envoyer à un vendeur
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {locationLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Localisation en cours...</Typography>
          </Box>
        ) : (
          <>
            {/* Request Configuration */}
            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Configuration de la demande
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Urgence</InputLabel>
                  <Select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    label="Urgence"
                  >
                    <MenuItem value="low">Faible</MenuItem>
                    <MenuItem value="medium">Moyenne</MenuItem>
                    <MenuItem value="high">Élevée</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Livraison</InputLabel>
                  <Select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    label="Livraison"
                  >
                    <MenuItem value="pickup">Retrait</MenuItem>
                    <MenuItem value="delivery">Livraison</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Message (optionnel)"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Informations supplémentaires pour les vendeurs..."
                size="small"
              />
            </Box>

            <Divider />

            {/* Map Section */}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Carte des vendeurs
              </Typography>

              <SmartMapWrapper
                sellers={nearbySellers}
                userLocation={userLocation}
                height={300}
                showSearch={true}
                showFilters={false}
                onSellerClick={(seller) => {
                  if (!selectedSellers.includes(seller.id)) {
                    handleSellerToggle(seller.id);
                  }
                }}
              />
            </Box>

            <Divider />

            {/* Sellers List */}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vendeurs disponibles ({nearbySellers.length})
              </Typography>
              
              {nearbySellers.length === 0 ? (
                <Alert severity="info">
                  Aucun vendeur trouvé dans votre région. Essayez d'élargir votre zone de recherche.
                </Alert>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {nearbySellers.map((seller) => {
                    const isSelected = selectedSellers.includes(seller.id);
                    const distance = formatDistance(seller);
                    
                    return (
                      <ListItem
                        key={seller.id}
                        sx={{
                          border: 1,
                          borderColor: isSelected ? SELLER_THEME.primary : 'grey.300',
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: isSelected ? `${SELLER_THEME.primary}10` : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: isSelected ? `${SELLER_THEME.primary}20` : 'grey.50',
                            transform: 'translateY(-1px)',
                            boxShadow: 1
                          }
                        }}
                        onClick={() => handleSellerToggle(seller.id)}
                      >
                        <ListItemIcon>
                          <Avatar 
                            src={seller.logoUrl} 
                            sx={{ 
                              bgcolor: SELLER_THEME.primary,
                              width: 48,
                              height: 48
                            }}
                          >
                            <Store />
                          </Avatar>
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {seller.shopName}
                              </Typography>
                              {seller.isVerified && (
                                <Verified color="primary" fontSize="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {seller.description}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                  icon={<LocationOn />}
                                  label={distance}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Rating 
                                    value={seller.stats?.averageRating || 0} 
                                    readOnly 
                                    size="small" 
                                  />
                                  <Typography variant="caption">
                                    ({seller.stats?.totalOrders || 0})
                                  </Typography>
                                </Box>
                                
                                {seller.settings?.acceptsDelivery && (
                                  <Chip
                                    icon={<LocalShipping />}
                                    label="Livraison"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSendRequests}
          disabled={loading || selectedSellers.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{ 
            bgcolor: SELLER_THEME.primary,
            '&:hover': { bgcolor: SELLER_THEME.secondary }
          }}
        >
          {loading ? 'Envoi...' : `Envoyer à ${selectedSellers.length} vendeur(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SellerDiscovery;
