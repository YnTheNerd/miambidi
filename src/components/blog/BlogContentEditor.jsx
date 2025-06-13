/**
 * Blog Content Editor Component
 * Template-specific content editing interface
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Alert,
  Divider
} from '@mui/material';
import {
  Image,
  Upload,
  Delete,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { BLOG_TEMPLATES } from '../../types/blog';

function BlogContentEditor({ 
  template, 
  content, 
  onContentChange, 
  disabled = false,
  errors = {} 
}) {
  const [editingSection, setEditingSection] = useState(null);
  const fileInputRefs = useRef({});

  const templateConfig = BLOG_TEMPLATES[template];

  const handleImageUpload = (sectionKey, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Taille maximale: 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Format d\'image non supporté. Utilisez JPG, PNG ou WebP');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        handleContentUpdate(sectionKey, base64String);
      };
      reader.onerror = () => {
        alert('Erreur lors de la lecture du fichier');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentUpdate = (key, value) => {
    const updatedContent = { ...content };
    
    if (key.includes('.')) {
      // Handle nested properties (e.g., 'heroImage.url')
      const keys = key.split('.');
      let current = updatedContent;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedContent[key] = value;
    }
    
    onContentChange(updatedContent);
  };

  const renderTemplateAEditor = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Image Héros + Texte Principal
      </Typography>
      
      {/* Hero Image Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Image Héros
          </Typography>
          
          {content.heroImage?.url ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <CardMedia
                component="img"
                height="200"
                image={content.heroImage.url}
                alt={content.heroImage?.alt || 'Image héros'}
                sx={{ borderRadius: 1 }}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                onClick={() => handleContentUpdate('heroImage.url', '')}
                disabled={disabled}
              >
                <Delete />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                height: 200,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                cursor: disabled ? 'default' : 'pointer'
              }}
              onClick={() => !disabled && fileInputRefs.current.heroImage?.click()}
            >
              <Image sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Cliquez pour ajouter une image héros
              </Typography>
            </Box>
          )}

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={el => fileInputRefs.current.heroImage = el}
            onChange={(e) => handleImageUpload('heroImage', e)}
            disabled={disabled}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Texte alternatif"
                value={content.heroImage?.alt || ''}
                onChange={(e) => handleContentUpdate('heroImage.alt', e.target.value)}
                disabled={disabled}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Légende (optionnel)"
                value={content.heroImage?.caption || ''}
                onChange={(e) => handleContentUpdate('heroImage.caption', e.target.value)}
                disabled={disabled}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Text Section */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Texte Principal
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Contenu de l'article"
            value={content.mainText || ''}
            onChange={(e) => handleContentUpdate('mainText', e.target.value)}
            disabled={disabled}
            error={!!errors.mainText}
            helperText={errors.mainText || 'Rédigez le contenu principal de votre article'}
            placeholder="Rédigez votre article ici. Vous pouvez utiliser du texte enrichi..."
          />
        </CardContent>
      </Card>
    </Box>
  );

  const renderTemplateBEditor = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Images et Textes en Alternance
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ce modèle alterne entre images et blocs de texte. Vous pouvez ajouter jusqu'à 2 images et 2 blocs de texte.
      </Alert>

      {/* Section 1: Image */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Première Image
          </Typography>
          {content.image1 ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <CardMedia
                component="img"
                height="150"
                image={content.image1}
                alt="Première image"
                sx={{ borderRadius: 1 }}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                onClick={() => handleContentUpdate('image1', '')}
                disabled={disabled}
              >
                <Delete />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                height: 150,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'default' : 'pointer'
              }}
              onClick={() => !disabled && fileInputRefs.current.image1?.click()}
            >
              <Image sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Première image
              </Typography>
            </Box>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={el => fileInputRefs.current.image1 = el}
            onChange={(e) => handleImageUpload('image1', e)}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Section 2: Text */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Premier Bloc de Texte
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Premier paragraphe"
            value={content.text1 || ''}
            onChange={(e) => handleContentUpdate('text1', e.target.value)}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Section 3: Text */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Deuxième Bloc de Texte
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Deuxième paragraphe"
            value={content.text2 || ''}
            onChange={(e) => handleContentUpdate('text2', e.target.value)}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Section 4: Image */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Deuxième Image
          </Typography>
          {content.image2 ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <CardMedia
                component="img"
                height="150"
                image={content.image2}
                alt="Deuxième image"
                sx={{ borderRadius: 1 }}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                onClick={() => handleContentUpdate('image2', '')}
                disabled={disabled}
              >
                <Delete />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                height: 150,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'default' : 'pointer'
              }}
              onClick={() => !disabled && fileInputRefs.current.image2?.click()}
            >
              <Image sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Deuxième image
              </Typography>
            </Box>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={el => fileInputRefs.current.image2 = el}
            onChange={(e) => handleImageUpload('image2', e)}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </Box>
  );

  const renderTemplateCEditor = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Galerie + Description
      </Typography>
      
      {/* Gallery Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Galerie d'Images
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box
                sx={{
                  height: 150,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled ? 'default' : 'pointer'
                }}
                onClick={() => !disabled && fileInputRefs.current.gallery1?.click()}
              >
                <Image sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Image 1
                </Typography>
              </Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={el => fileInputRefs.current.gallery1 = el}
                onChange={(e) => handleImageUpload('gallery1', e)}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  height: 150,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled ? 'default' : 'pointer'
                }}
                onClick={() => !disabled && fileInputRefs.current.gallery2?.click()}
              >
                <Image sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Image 2
                </Typography>
              </Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={el => fileInputRefs.current.gallery2 = el}
                onChange={(e) => handleImageUpload('gallery2', e)}
                disabled={disabled}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Description Section */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Description de la Galerie
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Description"
            value={content.description || ''}
            onChange={(e) => handleContentUpdate('description', e.target.value)}
            disabled={disabled}
            error={!!errors.description}
            helperText={errors.description || 'Décrivez les images de votre galerie'}
            placeholder="Décrivez le contenu de votre galerie d'images..."
          />
        </CardContent>
      </Card>
    </Box>
  );

  const renderEditor = () => {
    switch (template) {
      case 'template-a':
        return renderTemplateAEditor();
      case 'template-b':
        return renderTemplateBEditor();
      case 'template-c':
        return renderTemplateCEditor();
      default:
        return (
          <Alert severity="warning">
            Modèle non reconnu: {template}
          </Alert>
        );
    }
  };

  if (!templateConfig) {
    return (
      <Alert severity="error">
        Modèle de blog invalide. Veuillez sélectionner un modèle valide.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
          {templateConfig.icon} {templateConfig.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.contrastText', opacity: 0.9 }}>
          {templateConfig.description}
        </Typography>
      </Box>

      {renderEditor()}
    </Box>
  );
}

export default BlogContentEditor;
