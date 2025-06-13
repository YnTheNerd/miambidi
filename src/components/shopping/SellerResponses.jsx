/**
 * Seller Responses Component
 * Displays seller responses to shopping list requests for families
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge
} from '@mui/material';
import {
  Store,
  CheckCircle,
  Cancel,
  Schedule,
  LocalShipping,
  AttachMoney,
  ShoppingCart,
  Close,
  Visibility
} from '@mui/icons-material';
import { SELLER_THEME } from '../../types/seller';

function SellerResponses({ open, onClose }) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data for demonstration
  const mockResponses = [
    {
      id: '1',
      sellerId: 'seller1',
      sellerName: 'Marché Central Yaoundé',
      sellerLogo: null,
      status: 'accepted',
      totalPrice: 15500,
      deliveryFee: 500,
      estimatedTime: '2 heures',
      deliveryMethod: 'delivery',
      message: 'Tous les articles sont disponibles. Livraison possible cet après-midi.',
      availableItems: [
        { name: 'Tomates', quantity: 2, unit: 'kg', price: 1500 },
        { name: 'Oignons', quantity: 1, unit: 'kg', price: 800 },
        { name: 'Riz', quantity: 5, unit: 'kg', price: 3500 }
      ],
      unavailableItems: [],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
      clientStatus: 'pending'
    },
    {
      id: '2',
      sellerId: 'seller2',
      sellerName: 'Épicerie du Quartier',
      sellerLogo: null,
      status: 'partial',
      totalPrice: 8200,
      deliveryFee: 300,
      estimatedTime: '1 heure',
      deliveryMethod: 'pickup',
      message: 'Quelques articles manquants, mais je peux proposer des substituts.',
      availableItems: [
        { name: 'Oignons', quantity: 1, unit: 'kg', price: 900 },
        { name: 'Huile de palme', quantity: 1, unit: 'L', price: 2500 }
      ],
      unavailableItems: [
        { name: 'Tomates', quantity: 2, unit: 'kg', reason: 'Rupture de stock' }
      ],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
      clientStatus: 'pending'
    }
  ];

  const handleAcceptResponse = (responseId) => {
    console.log('Accepting response:', responseId);
    // Here we would implement the actual acceptance logic
  };

  const handleRejectResponse = (responseId) => {
    console.log('Rejecting response:', responseId);
    // Here we would implement the actual rejection logic
  };

  const handleViewDetails = (response) => {
    setSelectedResponse(response);
    setDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'partial': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'partial': return 'Partiel';
      case 'rejected': return 'Rejeté';
      default: return 'En attente';
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const timeLeft = expiresAt - now;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    
    if (hoursLeft < 1) {
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));
      return `${minutesLeft}min restantes`;
    }
    
    return `${hoursLeft}h restantes`;
  };

  return (
    <>
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
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Store />
            Réponses des vendeurs
            <Badge badgeContent={mockResponses.length} color="error" />
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {mockResponses.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="info">
                Aucune réponse de vendeur pour le moment. Envoyez votre liste de courses à des vendeurs pour recevoir des offres.
              </Alert>
            </Box>
          ) : (
            <List sx={{ p: 2 }}>
              {mockResponses.map((response, index) => (
                <React.Fragment key={response.id}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: 'white',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: 2
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={response.sellerLogo} 
                          sx={{ bgcolor: SELLER_THEME.primary }}
                        >
                          <Store />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {response.sellerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeRemaining(response.expiresAt)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Chip
                        label={getStatusLabel(response.status)}
                        color={getStatusColor(response.status)}
                        size="small"
                      />
                    </Box>

                    {/* Content */}
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {response.message}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                        <Chip
                          icon={<AttachMoney />}
                          label={`${response.totalPrice.toLocaleString()} FCFA`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        
                        <Chip
                          icon={<LocalShipping />}
                          label={response.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait'}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        
                        <Chip
                          icon={<Schedule />}
                          label={response.estimatedTime}
                          size="small"
                          variant="outlined"
                        />
                        
                        <Chip
                          icon={<ShoppingCart />}
                          label={`${response.availableItems.length} articles`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(response)}
                      >
                        Détails
                      </Button>
                      
                      {response.clientStatus === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleRejectResponse(response.id)}
                          >
                            Refuser
                          </Button>
                          
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleAcceptResponse(response.id)}
                          >
                            Accepter
                          </Button>
                        </>
                      )}
                    </Box>
                  </ListItem>
                  
                  {index < mockResponses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Détails de l'offre - {selectedResponse?.sellerName}
        </DialogTitle>
        
        <DialogContent>
          {selectedResponse && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Articles disponibles
              </Typography>
              
              <List dense>
                {selectedResponse.availableItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${item.quantity} ${item.unit} ${item.name}`}
                      secondary={`${item.price} FCFA`}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedResponse.unavailableItems.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Articles non disponibles
                  </Typography>
                  
                  <List dense>
                    {selectedResponse.unavailableItems.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Cancel color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${item.quantity} ${item.unit} ${item.name}`}
                          secondary={item.reason}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Sous-total: {selectedResponse.totalPrice.toLocaleString()} FCFA
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Frais de livraison: {selectedResponse.deliveryFee.toLocaleString()} FCFA
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="h6">
                  Total: {(selectedResponse.totalPrice + selectedResponse.deliveryFee).toLocaleString()} FCFA
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SellerResponses;
