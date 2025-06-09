import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import {
  CalendarMonth,
  MenuBook,
  ShoppingCart,
  Group,
  TrendingUp,
  Restaurant
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../contexts/FirestoreFamilyContext';
import { useRecipes } from '../contexts/RecipeContext';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, family, familyMembers } = useFamily();
  const { getAllRecipes } = useRecipes();

  const quickActions = [
    {
      title: 'Planifier cette Semaine',
      description: 'Ajouter des repas à votre calendrier hebdomadaire',
      icon: <CalendarMonth />,
      action: () => navigate('/calendar'),
      color: 'primary'
    },
    {
      title: 'Parcourir les Recettes',
      description: 'Découvrir de nouvelles recettes pour votre famille',
      icon: <MenuBook />,
      action: () => navigate('/recipes'),
      color: 'secondary'
    },
    {
      title: 'Liste de Courses',
      description: 'Voir et gérer votre liste de courses',
      icon: <ShoppingCart />,
      action: () => navigate('/shopping'),
      color: 'success'
    },
    {
      title: 'Paramètres Famille',
      description: 'Gérer les membres et préférences de la famille',
      icon: <Group />,
      action: () => navigate('/family'),
      color: 'info'
    }
  ];

  const stats = [
    { label: 'Membres Famille', value: familyMembers.length, icon: <Group /> },
    { label: 'Recettes Sauvées', value: getAllRecipes().length, icon: <MenuBook /> },
    { label: 'Repas Planifiés', value: '8', icon: <Restaurant /> },
    { label: 'Cette Semaine', value: '5/7', icon: <CalendarMonth /> }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser?.displayName || 'there'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's plan some delicious meals for {family?.name}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h6">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" component="h2">
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color={action.color}
                  onClick={action.action}
                  fullWidth
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Family Overview */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Family Overview
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Group sx={{ mr: 1 }} />
            <Typography variant="h6">{family?.name}</Typography>
            <Chip
              label={currentUser?.role === 'admin' ? 'Admin' : 'Member'}
              size="small"
              sx={{ ml: 2 }}
              color={currentUser?.role === 'admin' ? 'primary' : 'default'}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Family ID: {family?.id}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Family Members ({familyMembers.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {familyMembers.map((member, index) => (
              <Chip
                key={member.uid}
                avatar={<Avatar>{member.displayName?.charAt(0)}</Avatar>}
                label={member.displayName}
                variant={member.uid === currentUser?.uid ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4 }}>
        Recent Activity
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No recent activity yet. Start planning meals to see updates here!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;
