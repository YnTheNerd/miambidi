/**
 * Seller Dashboard Page
 * Main dashboard for seller users to manage their marketplace presence
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Store,
  Inventory,
  ShoppingCart,
  TrendingUp,
  LocationOn,
  Phone,
  Email,
  Star,
  Add,
  Edit,
  Notifications,
  AttachMoney
} from '@mui/icons-material';
import { useSeller } from '../contexts/SellerContext';
import { useAuth } from '../contexts/AuthContext';
import { SELLER_THEME } from '../types/seller';
import StockManagement from '../components/seller/StockManagement';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`seller-tabpanel-${index}`}
      aria-labelledby={`seller-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function SellerDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();
  const { 
    sellerProfile, 
    sellerStock, 
    shoppingRequests, 
    loading, 
    error,
    isSeller 
  } = useSeller();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Redirect if not a seller
  if (!loading && !isSeller) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Vous n'avez pas accès à cette page. Seuls les vendeurs peuvent accéder au tableau de bord vendeur.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!sellerProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Profil vendeur non trouvé. Veuillez créer votre profil vendeur.
        </Alert>
      </Box>
    );
  }

  const stats = sellerProfile.stats || {};

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar 
            src={sellerProfile.logoUrl} 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: SELLER_THEME.primary 
            }}
          >
            <Store fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {sellerProfile.shopName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {sellerProfile.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                label={sellerProfile.isActive ? 'Actif' : 'Inactif'}
                color={sellerProfile.isActive ? 'success' : 'default'}
                size="small"
              />
              {sellerProfile.isVerified && (
                <Chip
                  label="Vérifié"
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: SELLER_THEME.primary }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalOrders || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commandes totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: SELLER_THEME.secondary }}>
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography variant="h6">{sellerStock.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Articles en stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: SELLER_THEME.accent }}>
                  <Star />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Note moyenne
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: SELLER_THEME.background }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: SELLER_THEME.success }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {stats.totalRevenue ? `${stats.totalRevenue.toLocaleString()} FCFA` : '0 FCFA'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenus totaux
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: SELLER_THEME.text.secondary,
            },
            '& .Mui-selected': {
              color: SELLER_THEME.primary,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: SELLER_THEME.primary,
            }
          }}
        >
          <Tab label="Profil" />
          <Tab label="Stock" />
          <Tab label="Demandes" />
          <Tab label="Paramètres" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Profile Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations de base
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Store /></ListItemIcon>
                    <ListItemText 
                      primary="Nom de la boutique" 
                      secondary={sellerProfile.shopName} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={sellerProfile.email} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText 
                      primary="Téléphone" 
                      secondary={sellerProfile.businessInfo?.phoneNumber || 'Non renseigné'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationOn /></ListItemIcon>
                    <ListItemText 
                      primary="Adresse" 
                      secondary={sellerProfile.location?.address || 'Non renseignée'} 
                    />
                  </ListItem>
                </List>
                <Button 
                  variant="outlined" 
                  startIcon={<Edit />}
                  sx={{ mt: 2 }}
                >
                  Modifier le profil
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Paramètres de livraison
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Rayon de livraison" 
                      secondary={`${sellerProfile.location?.deliveryRadius || 5} km`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Frais de livraison" 
                      secondary={`${sellerProfile.settings?.deliveryFee || 0} FCFA`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Commande minimum" 
                      secondary={`${sellerProfile.settings?.minimumOrderValue || 0} FCFA`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Stock Tab */}
        <StockManagement />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Requests Tab */}
        <Typography variant="h6" gutterBottom>
          Demandes de courses ({shoppingRequests.length})
        </Typography>
        
        {shoppingRequests.length === 0 ? (
          <Alert severity="info">
            Aucune demande de courses reçue pour le moment.
          </Alert>
        ) : (
          <Typography variant="body1">
            Fonctionnalité de gestion des demandes en cours de développement.
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Settings Tab */}
        <Typography variant="h6" gutterBottom>
          Paramètres du compte
        </Typography>
        <Typography variant="body1">
          Fonctionnalité de paramètres en cours de développement.
        </Typography>
      </TabPanel>
    </Box>
  );
}

export default SellerDashboard;
