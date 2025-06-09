/**
 * Pantry Statistics Card for MiamBidi
 * Displays comprehensive pantry statistics with visual indicators
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Inventory,
  Warning,
  Error,
  TrendingDown,
  AttachMoney,
  CheckCircle
} from '@mui/icons-material';

function PantryStatsCard({ stats }) {
  const {
    totalItems = 0,
    expiredCount = 0,
    expiringCount = 0,
    lowStockCount = 0,
    totalValue = 0
  } = stats;

  // Calculate percentages for progress bars
  const expiredPercentage = totalItems > 0 ? (expiredCount / totalItems) * 100 : 0;
  const expiringPercentage = totalItems > 0 ? (expiringCount / totalItems) * 100 : 0;
  const lowStockPercentage = totalItems > 0 ? (lowStockCount / totalItems) * 100 : 0;
  const healthyCount = totalItems - expiredCount - expiringCount;
  const healthyPercentage = totalItems > 0 ? (healthyCount / totalItems) * 100 : 0;

  // Get overall health status
  const getHealthStatus = () => {
    if (totalItems === 0) return { status: 'empty', color: 'default', text: 'Vide' };
    if (expiredPercentage > 20) return { status: 'critical', color: 'error', text: 'Critique' };
    if (expiringPercentage > 30) return { status: 'warning', color: 'warning', text: 'Attention' };
    if (healthyPercentage > 70) return { status: 'good', color: 'success', text: 'Bon' };
    return { status: 'average', color: 'info', text: 'Moyen' };
  };

  const healthStatus = getHealthStatus();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory color="primary" />
          Statistiques du Garde-Manger
          <Chip 
            label={healthStatus.text} 
            color={healthStatus.color} 
            size="small" 
            sx={{ ml: 'auto' }}
          />
        </Typography>

        <Grid container spacing={3}>
          {/* Total Items */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingrédients Total
              </Typography>
            </Box>
          </Grid>

          {/* Total Value */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <AttachMoney fontSize="large" />
                {Math.round(totalValue).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valeur Totale (FCFA)
              </Typography>
            </Box>
          </Grid>

          {/* Healthy Items */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <CheckCircle fontSize="large" />
                {healthyCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingrédients Frais
              </Typography>
              {totalItems > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={healthyPercentage} 
                  color="success"
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              )}
            </Box>
          </Grid>

          {/* Attention Items */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Warning fontSize="large" />
                {expiringCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bientôt Expirés
              </Typography>
              {totalItems > 0 && expiringCount > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={expiringPercentage} 
                  color="warning"
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Additional Stats Row */}
        <Grid container spacing={2}>
          {/* Expired Items */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
              <Error color="error" />
              <Box>
                <Typography variant="h6" color="error.main">
                  {expiredCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expirés
                </Typography>
              </Box>
              {totalItems > 0 && expiredCount > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={expiredPercentage} 
                  color="error"
                  sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                />
              )}
            </Box>
          </Grid>

          {/* Low Stock Items */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
              <TrendingDown color="info" />
              <Box>
                <Typography variant="h6" color="info.main">
                  {lowStockCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Stock Faible
                </Typography>
              </Box>
              {totalItems > 0 && lowStockCount > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={lowStockPercentage} 
                  color="info"
                  sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                />
              )}
            </Box>
          </Grid>

          {/* Health Score */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
              <CheckCircle color={healthStatus.color} />
              <Box>
                <Typography variant="h6" color={`${healthStatus.color}.main`}>
                  {Math.round(healthyPercentage)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  État Général
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={healthyPercentage} 
                color={healthStatus.color}
                sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Quick Tips */}
        {totalItems > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Conseils Rapides
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {expiredCount > 0 && (
                <Chip 
                  label={`${expiredCount} ingrédient(s) à retirer`} 
                  color="error" 
                  size="small" 
                  variant="outlined"
                />
              )}
              {expiringCount > 0 && (
                <Chip 
                  label={`${expiringCount} ingrédient(s) à utiliser rapidement`} 
                  color="warning" 
                  size="small" 
                  variant="outlined"
                />
              )}
              {lowStockCount > 0 && (
                <Chip 
                  label={`${lowStockCount} ingrédient(s) à racheter`} 
                  color="info" 
                  size="small" 
                  variant="outlined"
                />
              )}
              {healthyPercentage > 80 && (
                <Chip 
                  label="Excellent garde-manger !" 
                  color="success" 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {totalItems === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Votre garde-manger est vide
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Commencez par ajouter des ingrédients pour suivre votre stock
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PantryStatsCard;
