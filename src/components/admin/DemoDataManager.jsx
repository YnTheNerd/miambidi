/**
 * Demo Data Manager Component
 * For testing and development purposes
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Add,
  Store,
  Inventory,
  LocationOn,
  Refresh,
  Delete,
  Warning
} from '@mui/icons-material';
import { useSeller } from '../../contexts/SellerContext';
import { SELLER_THEME } from '../../types/seller';

function DemoDataManager() {
  const [loading, setLoading] = useState(false);
  const { allSellers, populateDemoData } = useSeller();

  const handlePopulateDemoData = async () => {
    setLoading(true);
    try {
      await populateDemoData(10);
    } catch (error) {
      console.error('Error populating demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const demoSellers = allSellers.filter(seller => seller.id?.startsWith('demo-seller-'));
  const realSellers = allSellers.filter(seller => !seller.id?.startsWith('demo-seller-'));

  const getSellerStats = () => {
    const total = allSellers.length;
    const demo = demoSellers.length;
    const real = realSellers.length;
    const active = allSellers.filter(s => s.isActive).length;
    const verified = allSellers.filter(s => s.isVerified).length;

    return { total, demo, real, active, verified };
  };

  const stats = getSellerStats();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestionnaire de Données de Démonstration
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cet outil permet de créer des données de test pour le marketplace MiamBidi.
        Les vendeurs de démonstration sont situés autour de Yaoundé avec des stocks réalistes.
      </Alert>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total vendeurs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.demo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Démonstration
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.real}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Réels
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {stats.verified}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vérifiés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          onClick={handlePopulateDemoData}
          disabled={loading || demoSellers.length > 0}
          sx={{ 
            bgcolor: SELLER_THEME.primary,
            '&:hover': { bgcolor: SELLER_THEME.secondary }
          }}
        >
          {loading ? 'Création en cours...' : 'Créer données de démo'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
        >
          Actualiser
        </Button>
      </Box>

      {/* Demo Sellers List */}
      {demoSellers.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vendeurs de Démonstration ({demoSellers.length})
            </Typography>
            
            <List>
              {demoSellers.slice(0, 5).map((seller, index) => (
                <React.Fragment key={seller.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Store sx={{ color: SELLER_THEME.primary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={seller.shopName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {seller.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<LocationOn />}
                              label={seller.location?.city || 'Yaoundé'}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<Inventory />}
                              label={`${seller.stats?.activeStock || 0} articles`}
                              size="small"
                              color="primary"
                            />
                            {seller.isVerified && (
                              <Chip
                                label="Vérifié"
                                size="small"
                                color="success"
                              />
                            )}
                            {seller.settings?.acceptsDelivery && (
                              <Chip
                                label="Livraison"
                                size="small"
                                color="info"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < Math.min(4, demoSellers.length - 1) && <Divider />}
                </React.Fragment>
              ))}
              
              {demoSellers.length > 5 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        ... et {demoSellers.length - 5} autres vendeurs
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Real Sellers List */}
      {realSellers.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vendeurs Réels ({realSellers.length})
            </Typography>
            
            <List>
              {realSellers.slice(0, 3).map((seller, index) => (
                <React.Fragment key={seller.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Store color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={seller.shopName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {seller.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<LocationOn />}
                              label={seller.location?.city || 'Non spécifié'}
                              size="small"
                              variant="outlined"
                            />
                            {seller.isVerified && (
                              <Chip
                                label="Vérifié"
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < Math.min(2, realSellers.length - 1) && <Divider />}
                </React.Fragment>
              ))}
              
              {realSellers.length > 3 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        ... et {realSellers.length - 3} autres vendeurs réels
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Instructions d'utilisation :
        </Typography>
        <Typography variant="body2" component="div">
          • Cliquez sur "Créer données de démo" pour générer 10 vendeurs fictifs autour de Yaoundé
          <br />
          • Chaque vendeur aura un stock automatiquement généré basé sur les recettes populaires
          <br />
          • Les données incluent des coordonnées GPS réalistes, prix du marché camerounais, et horaires d'ouverture
          <br />
          • Utilisez ces données pour tester les fonctionnalités de découverte de vendeurs et de marketplace
        </Typography>
      </Alert>
    </Box>
  );
}

export default DemoDataManager;
