/**
 * Stock Management Component for Sellers
 * Automated and manual stock management with recipe-based suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  AutoAwesome,
  TrendingUp,
  Inventory,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useSeller } from '../../contexts/SellerContext';
import { useRecipes } from '../../contexts/RecipeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { SELLER_THEME } from '../../types/seller';
import { GROCERY_CATEGORIES } from '../../types/shoppingList';
import { generateSellerStock, analyzeRecipeIngredients } from '../../utils/stockGenerator';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-tabpanel-${index}`}
      aria-labelledby={`stock-tab-${index}`}
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

function StockManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [autoGenerateOpen, setAutoGenerateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    ingredientName: '',
    quantity: 0,
    unit: 'kg',
    pricePerUnit: 0,
    quality: 'standard',
    category: '',
    minimumQuantity: 1,
    isAvailable: true,
    notes: ''
  });

  const { 
    sellerProfile, 
    sellerStock, 
    addStockItem, 
    updateStockItem, 
    removeStockItem 
  } = useSeller();
  
  const { getAllRecipes } = useRecipes();
  const { showNotification } = useNotification();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddItem = async () => {
    try {
      await addStockItem(newItem);
      setAddItemOpen(false);
      setNewItem({
        ingredientName: '',
        quantity: 0,
        unit: 'kg',
        pricePerUnit: 0,
        quality: 'standard',
        category: '',
        minimumQuantity: 1,
        isAvailable: true,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding stock item:', error);
    }
  };

  const handleEditItem = async () => {
    try {
      await updateStockItem(editItem.id, editItem);
      setEditItem(null);
    } catch (error) {
      console.error('Error updating stock item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await removeStockItem(itemId);
    } catch (error) {
      console.error('Error removing stock item:', error);
    }
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    try {
      const recipes = getAllRecipes();
      const publicRecipes = recipes.filter(recipe => recipe.isPublic);
      
      if (publicRecipes.length === 0) {
        showNotification('Aucune recette publique trouvée pour générer le stock', 'warning');
        return;
      }

      const generatedStock = generateSellerStock(publicRecipes, sellerProfile, {
        maxItems: 30,
        includePopularOnly: false
      });

      // Add generated items to stock
      for (const item of generatedStock) {
        // Check if item already exists
        const exists = sellerStock.find(stock => 
          stock.ingredientName.toLowerCase() === item.ingredientName.toLowerCase()
        );
        
        if (!exists) {
          await addStockItem(item);
        }
      }

      showNotification(`${generatedStock.length} articles ajoutés automatiquement`, 'success');
      setAutoGenerateOpen(false);
    } catch (error) {
      console.error('Error auto-generating stock:', error);
      showNotification('Erreur lors de la génération automatique', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStockStats = () => {
    const total = sellerStock.length;
    const available = sellerStock.filter(item => item.isAvailable).length;
    const lowStock = sellerStock.filter(item => item.quantity <= item.minimumQuantity).length;
    const outOfStock = sellerStock.filter(item => item.quantity === 0).length;
    
    return { total, available, lowStock, outOfStock };
  };

  const stats = getStockStats();

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'premium': return 'success';
      case 'standard': return 'primary';
      case 'economy': return 'warning';
      default: return 'default';
    }
  };

  const getQualityLabel = (quality) => {
    switch (quality) {
      case 'premium': return 'Premium';
      case 'standard': return 'Standard';
      case 'economy': return 'Économique';
      default: return quality;
    }
  };

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestion du Stock
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: SELLER_THEME.background }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Articles total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: SELLER_THEME.background }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.available}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: SELLER_THEME.background }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.lowStock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock faible
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: SELLER_THEME.background }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {stats.outOfStock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rupture
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddItemOpen(true)}
            sx={{ 
              bgcolor: SELLER_THEME.primary,
              '&:hover': { bgcolor: SELLER_THEME.secondary }
            }}
          >
            Ajouter un article
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => setAutoGenerateOpen(true)}
            sx={{ 
              borderColor: SELLER_THEME.primary,
              color: SELLER_THEME.primary
            }}
          >
            Génération automatique
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

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
          <Tab label="Tous les articles" />
          <Tab label="Stock faible" />
          <Tab label="Ruptures" />
          <Tab label="Analyses" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* All Items */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Article</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Prix unitaire</TableCell>
                <TableCell>Qualité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sellerStock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: SELLER_THEME.primary, width: 32, height: 32 }}>
                        {item.ingredientName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {item.ingredientName}
                        </Typography>
                        {item.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {item.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.quantity} {item.unit}
                    </Typography>
                    {item.quantity <= item.minimumQuantity && (
                      <Chip 
                        label="Stock faible" 
                        size="small" 
                        color="warning" 
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.pricePerUnit.toLocaleString()} FCFA
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getQualityLabel(item.quality)} 
                      size="small" 
                      color={getQualityColor(item.quality)}
                    />
                  </TableCell>
                  <TableCell>
                    {item.isAvailable ? (
                      <Chip 
                        icon={<CheckCircle />} 
                        label="Disponible" 
                        size="small" 
                        color="success" 
                      />
                    ) : (
                      <Chip 
                        icon={<Cancel />} 
                        label="Indisponible" 
                        size="small" 
                        color="error" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Modifier">
                        <IconButton 
                          size="small" 
                          onClick={() => setEditItem(item)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Low Stock Items */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          Articles avec un stock inférieur au minimum recommandé
        </Alert>
        {/* Similar table but filtered for low stock */}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Out of Stock Items */}
        <Alert severity="error" sx={{ mb: 2 }}>
          Articles en rupture de stock
        </Alert>
        {/* Similar table but filtered for out of stock */}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Analytics */}
        <Typography variant="h6" gutterBottom>
          Analyses et recommandations
        </Typography>
        <Alert severity="info">
          Fonctionnalité d'analyse en cours de développement
        </Alert>
      </TabPanel>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un article au stock</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'ingrédient"
                value={newItem.ingredientName}
                onChange={(e) => setNewItem(prev => ({ ...prev, ingredientName: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantité"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Unité</InputLabel>
                <Select
                  value={newItem.unit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="pièce">pièce</MenuItem>
                  <MenuItem value="botte">botte</MenuItem>
                  <MenuItem value="boîte">boîte</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Prix unitaire (FCFA)"
                value={newItem.pricePerUnit}
                onChange={(e) => setNewItem(prev => ({ ...prev, pricePerUnit: parseInt(e.target.value) }))}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Qualité</InputLabel>
                <Select
                  value={newItem.quality}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quality: e.target.value }))}
                >
                  <MenuItem value="economy">Économique</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                >
                  {Object.keys(GROCERY_CATEGORIES).map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes (optionnel)"
                value={newItem.notes}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newItem.isAvailable}
                    onChange={(e) => setNewItem(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  />
                }
                label="Article disponible"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained"
            sx={{ 
              bgcolor: SELLER_THEME.primary,
              '&:hover': { bgcolor: SELLER_THEME.secondary }
            }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Generate Dialog */}
      <Dialog open={autoGenerateOpen} onClose={() => setAutoGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Génération automatique du stock</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Cette fonctionnalité analyse les recettes publiques pour générer automatiquement 
            votre stock avec des prix réalistes basés sur le marché camerounais.
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            • Analyse des ingrédients populaires dans les recettes
            • Prix basés sur les tarifs du marché local
            • Quantités optimisées selon la demande
            • Évite les doublons avec votre stock existant
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoGenerateOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleAutoGenerate} 
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: SELLER_THEME.primary,
              '&:hover': { bgcolor: SELLER_THEME.secondary }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Générer le stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StockManagement;
