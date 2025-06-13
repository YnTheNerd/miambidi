/**
 * Blog Preview Component
 * Shows how the blog article will look when published
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Chip,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import {
  Public,
  Lock,
  Schedule
} from '@mui/icons-material';
import { BLOG_TEMPLATES, BLOG_VISIBILITY } from '../../types/blog';

function BlogPreview({ 
  title, 
  template, 
  content, 
  excerpt, 
  tags = [], 
  visibility,
  authorName = 'Votre nom',
  publishedAt = new Date()
}) {
  const templateConfig = BLOG_TEMPLATES[template];

  const renderTemplateAPreview = () => (
    <Box>
      {/* Hero Image */}
      {content.heroImage?.url && (
        <Box sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            height="300"
            image={content.heroImage.url}
            alt={content.heroImage.alt || title}
            sx={{ borderRadius: 2 }}
          />
          {content.heroImage.caption && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'block', mt: 1, textAlign: 'center', fontStyle: 'italic' }}
            >
              {content.heroImage.caption}
            </Typography>
          )}
        </Box>
      )}

      {/* Main Text */}
      {content.mainText && (
        <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {content.mainText}
        </Typography>
      )}
    </Box>
  );

  const renderTemplateBPreview = () => (
    <Box>
      <Grid container spacing={3}>
        {/* First Image */}
        {content.image1 && (
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              height="200"
              image={content.image1}
              alt="Première image"
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        )}

        {/* First Text */}
        {content.text1 && (
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {content.text1}
            </Typography>
          </Grid>
        )}

        {/* Second Text */}
        {content.text2 && (
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {content.text2}
            </Typography>
          </Grid>
        )}

        {/* Second Image */}
        {content.image2 && (
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              height="200"
              image={content.image2}
              alt="Deuxième image"
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderTemplateCPreview = () => (
    <Box>
      {/* Gallery */}
      {(content.gallery1 || content.gallery2) && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {content.gallery1 && (
              <Grid item xs={12} sm={6}>
                <CardMedia
                  component="img"
                  height="250"
                  image={content.gallery1}
                  alt="Image de galerie 1"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            )}
            {content.gallery2 && (
              <Grid item xs={12} sm={6}>
                <CardMedia
                  component="img"
                  height="250"
                  image={content.gallery2}
                  alt="Image de galerie 2"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Description */}
      {content.description && (
        <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {content.description}
        </Typography>
      )}
    </Box>
  );

  const renderContent = () => {
    switch (template) {
      case 'template-a':
        return renderTemplateAPreview();
      case 'template-b':
        return renderTemplateBPreview();
      case 'template-c':
        return renderTemplateCPreview();
      default:
        return (
          <Alert severity="warning">
            Aperçu non disponible pour ce modèle
          </Alert>
        );
    }
  };

  if (!templateConfig) {
    return (
      <Alert severity="error">
        Modèle de blog invalide
      </Alert>
    );
  }

  return (
    <Card sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
      {/* Article Header */}
      <Box sx={{ mb: 3 }}>
        {/* Title */}
        <Typography variant="h4" component="h1" gutterBottom>
          {title || 'Titre de l\'article'}
        </Typography>

        {/* Metadata */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Par {authorName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {publishedAt.toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {visibility === BLOG_VISIBILITY.PUBLIC ? (
              <>
                <Public fontSize="small" color="success" />
                <Typography variant="body2" color="success.main">
                  Public
                </Typography>
              </>
            ) : (
              <>
                <Lock fontSize="small" color="warning" />
                <Typography variant="body2" color="warning.main">
                  Premium
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Template Info */}
        <Chip
          label={`${templateConfig.icon} ${templateConfig.name}`}
          size="small"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Excerpt */}
        {excerpt && (
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ 
              fontStyle: 'italic', 
              mb: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              borderLeft: '4px solid',
              borderLeftColor: 'primary.main'
            }}
          >
            {excerpt}
          </Typography>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        <Divider />
      </Box>

      {/* Article Content */}
      <Box sx={{ mb: 3 }}>
        {renderContent()}
      </Box>

      {/* Footer */}
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Article créé avec MiamBidi Blog
        </Typography>
      </Box>
    </Card>
  );
}

export default BlogPreview;
