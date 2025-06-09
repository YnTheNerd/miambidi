import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  PhotoCamera,
  Upload,
  Close,
  Search,
  Check,
  Image as ImageIcon
} from '@mui/icons-material';

// Predefined recipe images available in the local directory
const AVAILABLE_IMAGES = [
  {
    id: 'ndole',
    name: 'Ndolé',
    path: '/images/recipes/ndole.jpg',
    description: 'Plat traditionnel camerounais aux feuilles de ndolé'
  },
  {
    id: 'eru',
    name: 'Eru',
    path: '/images/recipes/eru.jpg',
    description: 'Soupe aux feuilles d\'eru'
  },
  {
    id: 'poulet-braise',
    name: 'Poulet Braisé',
    path: '/images/recipes/poulet-braise.jpg',
    description: 'Poulet braisé aux épices camerounaises'
  },
  {
    id: 'riz-saute',
    name: 'Riz Sauté',
    path: '/images/recipes/riz-saute.jpg',
    description: 'Riz sauté aux légumes'
  },
  {
    id: 'achu',
    name: 'Achu Soup',
    path: '/images/recipes/achu.jpg',
    description: 'Soupe jaune traditionnelle'
  },
  {
    id: 'beignets-haricots',
    name: 'Beignets Haricots',
    path: '/images/recipes/beignets-haricots.jpg',
    description: 'Beignets de haricots (Accra)'
  },
  {
    id: 'plantains-frits',
    name: 'Plantains Frits',
    path: '/images/recipes/plantains-frits.jpg',
    description: 'Plantains frits dorés'
  },
  {
    id: 'sauce-arachide',
    name: 'Sauce Arachide',
    path: '/images/recipes/sauce-arachide.jpg',
    description: 'Sauce à base d\'arachides'
  },
  {
    id: 'poisson-braise',
    name: 'Poisson Braisé',
    path: '/images/recipes/poisson-braise.jpg',
    description: 'Poisson braisé aux épices'
  },
  {
    id: 'koki',
    name: 'Koki',
    path: '/images/recipes/koki.jpg',
    description: 'Gâteau de haricots cuit à la vapeur'
  }
];

function ImageUpload({ currentImage, onImageSelect, recipeName = '' }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(currentImage || '');
  const fileInputRef = useRef(null);

  // Filter images based on search term or recipe name
  const filteredImages = AVAILABLE_IMAGES.filter(image => {
    const searchLower = searchTerm.toLowerCase();
    const recipeNameLower = recipeName.toLowerCase();

    return (
      image.name.toLowerCase().includes(searchLower) ||
      image.description.toLowerCase().includes(searchLower) ||
      (recipeName && image.name.toLowerCase().includes(recipeNameLower))
    );
  });

  // Auto-suggest images based on recipe name
  const suggestedImages = recipeName ?
    AVAILABLE_IMAGES.filter(image =>
      image.name.toLowerCase().includes(recipeName.toLowerCase()) ||
      recipeName.toLowerCase().includes(image.name.toLowerCase())
    ) : [];

  const handleImageSelect = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const handleConfirmSelection = () => {
    onImageSelect(selectedImage);
    setDialogOpen(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Convert file to base64 for Firestore storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setSelectedImage(base64String);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Erreur lors de la lecture du fichier. Veuillez réessayer.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    onImageSelect('');
  };

  return (
    <Box>
      {/* Current Image Display */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Card sx={{ width: 200, height: 150 }}>
            <CardMedia
              component="img"
              height="120"
              image={currentImage || '/images/recipes/default-meal.jpg'}
              alt={currentImage ? "Image de la recette" : "Image par défaut de recette"}
              sx={{ objectFit: 'cover' }}
              onError={(e) => {
                console.warn('Image failed to load:', currentImage);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <Box
              sx={{
                display: 'none',
                height: 120,
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200'
              }}
            >
              <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
            </Box>
            <CardActions sx={{ p: 1 }}>
              <Button size="small" onClick={() => setDialogOpen(true)}>
                {currentImage ? 'Changer' : 'Sélectionner'}
              </Button>
              {currentImage && (
                <Button size="small" color="error" onClick={handleRemoveImage}>
                  Supprimer
                </Button>
              )}
            </CardActions>
          </Card>
        </Box>

      </Box>

      {/* Image Selection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Sélectionner une Image
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Rechercher une image..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          {/* Suggested Images */}
          {suggestedImages.length > 0 && !searchTerm && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Images Suggérées pour "{recipeName}"
              </Typography>
              <Grid container spacing={2}>
                {suggestedImages.map((image) => (
                  <Grid item xs={6} sm={4} md={3} key={image.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedImage === image.path ? 2 : 0,
                        borderColor: 'primary.main',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => handleImageSelect(image.path)}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 100,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                        {selectedImage === image.path && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              p: 0.5
                            }}
                          >
                            <Check sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                        )}
                      </CardMedia>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" display="block">
                          {image.name}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* All Available Images */}
          <Typography variant="h6" gutterBottom>
            Images Disponibles
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {filteredImages.map((image) => (
              <Grid item xs={6} sm={4} md={3} key={image.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedImage === image.path ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => handleImageSelect(image.path)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 100,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                    {selectedImage === image.path && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'primary.main',
                          borderRadius: '50%',
                          p: 0.5
                        }}
                      >
                        <Check sx={{ fontSize: 16, color: 'white' }} />
                      </Box>
                    )}
                  </CardMedia>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" display="block">
                      {image.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {image.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Upload Custom Image */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Vous pouvez également télécharger votre propre image
          </Alert>

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />

          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Télécharger une Image Personnalisée
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSelection}
            disabled={!selectedImage}
          >
            Sélectionner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImageUpload;
