/**
 * Public Landing Page for MiamBidi
 * Showcases features and provides access to public content
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  Restaurant,
  ShoppingCart,
  Group,
  Schedule,
  TrendingUp,
  Public
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      title: 'Recettes Authentiques',
      description: 'Découvrez des recettes camerounaises traditionnelles et modernes, partagées par notre communauté.'
    },
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: 'Planification Intelligente',
      description: 'Planifiez vos repas de la semaine avec notre calendrier intuitif et drag-and-drop.'
    },
    {
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      title: 'Listes de Courses Automatiques',
      description: 'Générez automatiquement vos listes de courses à partir de vos repas planifiés.'
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Gestion Familiale',
      description: 'Collaborez en famille pour planifier les repas et gérer les préférences alimentaires.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Suivi des Coûts',
      description: 'Suivez vos dépenses alimentaires avec des prix en FCFA et des analyses détaillées.'
    },
    {
      icon: <Public sx={{ fontSize: 40 }} />,
      title: 'Communauté Active',
      description: 'Partagez vos recettes favorites et découvrez celles des autres familles.'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢
          </Typography>
          <Button color="primary" onClick={() => navigate('/recettes-publiques')}>
            Recettes Publiques
          </Button>
          <Button color="primary" onClick={() => navigate('/blogs')}>
            Blog
          </Button>
          <Button variant="outlined" onClick={() => navigate('/auth')} sx={{ ml: 1 }}>
            Connexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={800}>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                animation: 'slideInUp 0.8s ease-out',
                color: '#ffffff', // White text
              }}
            >
              Bienvenue sur <span style={{ textDecoration: 'underline' }}>MiamBidi</span>
            </Typography>
          </Fade>

          <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                animation: 'slideInUp 0.8s ease-out 0.2s both',
              }}
            >
              Votre assistant culinaire intelligent pour planifier vos repas en famille avec des recettes camerounaises authentiques
            </Typography>
          </Fade>

          <Fade in={true} timeout={1200} style={{ transitionDelay: '400ms' }}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'slideInUp 0.8s ease-out 0.4s both',
            }}>
              <Zoom in={true} timeout={600} style={{ transitionDelay: '600ms' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/auth')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                    px: 4,
                    py: 1.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Commencer Gratuitement
                </Button>
              </Zoom>

              <Zoom in={true} timeout={600} style={{ transitionDelay: '800ms' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/recettes-publiques')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                    px: 4,
                    py: 1.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Découvrir les Recettes
                </Button>
              </Zoom>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in={true} timeout={800}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 'bold',
              animation: 'slideInUp 0.8s ease-out',
            }}
          >
            Pourquoi Choisir MiamBidi ? 🤔
          </Typography>
        </Fade>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade
                in={true}
                timeout={600}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 24px rgba(46, 125, 50, 0.15)',
                    },
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Recettes Camerounaises
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                1000+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Familles Actives
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                10k+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Repas Planifiés
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Prêt à Transformer Votre Cuisine ?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Rejoignez des milliers de familles qui utilisent MiamBidi pour simplifier leur planification culinaire
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/auth')}
            sx={{ px: 6, py: 2 }}
          >
            Créer Mon Compte Gratuit
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                MiamBidi
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Votre assistant culinaire intelligent pour des repas familiaux savoureux et bien organisés.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Liens Rapides
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" onClick={() => navigate('/recettes-publiques')} sx={{ justifyContent: 'flex-start' }}>
                  Recettes Publiques
                </Button>
                <Button color="inherit" onClick={() => navigate('/blogs')} sx={{ justifyContent: 'flex-start' }}>
                  Blog
                </Button>
                <Button color="inherit" onClick={() => navigate('/auth')} sx={{ justifyContent: 'flex-start' }}>
                  Connexion
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2025 𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
