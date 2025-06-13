/**
 * Blog Template Selector Component
 * Allows users to choose from predefined blog layout templates
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Preview,
  Close,
  Image,
  TextFields,
  PhotoLibrary
} from '@mui/icons-material';
import { BLOG_TEMPLATES } from '../../types/blog';

function BlogTemplateSelector({ selectedTemplate, onTemplateSelect, disabled = false }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handlePreview = (templateId) => {
    setPreviewTemplate(BLOG_TEMPLATES[templateId]);
    setPreviewOpen(true);
  };

  const handleTemplateChange = (event) => {
    onTemplateSelect(event.target.value);
  };

  const renderTemplatePreview = (template) => {
    switch (template.id) {
      case 'template-a':
        return (
          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: 'grey.50' }}>
            <Box sx={{ 
              height: 120, 
              bgcolor: 'primary.light', 
              borderRadius: 1, 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Image sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ height: 60, bgcolor: 'grey.300', borderRadius: 1 }}>
              <Box sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Bloc de texte principal
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      
      case 'template-b':
        return (
          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: 'grey.50' }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Box sx={{ 
                  height: 60, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 1
                }}>
                  <Image sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ height: 40, bgcolor: 'grey.300', borderRadius: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: 40, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                <Box sx={{ 
                  height: 60, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Image sx={{ fontSize: 20 }} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'template-c':
        return (
          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: 'grey.50' }}>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ 
                  height: 60, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Image sx={{ fontSize: 20 }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  height: 60, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Image sx={{ fontSize: 20 }} />
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ height: 40, bgcolor: 'grey.300', borderRadius: 1 }} />
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <FormControl component="fieldset" fullWidth disabled={disabled}>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Choisissez un modèle d'article
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez la mise en page qui convient le mieux à votre contenu
          </Typography>
        </FormLabel>

        <RadioGroup
          value={selectedTemplate}
          onChange={handleTemplateChange}
          sx={{ gap: 2 }}
        >
          <Grid container spacing={3}>
            {Object.values(BLOG_TEMPLATES).map((template) => (
              <Grid item xs={12} md={4} key={template.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    cursor: disabled ? 'default' : 'pointer',
                    border: selectedTemplate === template.id ? '2px solid' : '1px solid',
                    borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                    '&:hover': disabled ? {} : {
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => !disabled && onTemplateSelect(template.id)}
                >
                  <Box sx={{ position: 'relative' }}>
                    {/* Template Preview */}
                    <CardContent sx={{ p: 1 }}>
                      {renderTemplatePreview(template)}
                    </CardContent>

                    {/* Radio Button */}
                    <FormControlLabel
                      value={template.id}
                      control={<Radio />}
                      label=""
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        m: 0
                      }}
                    />

                    {/* Preview Button */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      <Preview fontSize="small" />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {template.icon} {template.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Image />}
                        label={`${template.maxImages} image${template.maxImages > 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<TextFields />}
                        label={`${template.maxTextBlocks} texte${template.maxTextBlocks > 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </FormControl>

      {/* Template Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {previewTemplate?.icon} Aperçu: {previewTemplate?.name}
            </Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {previewTemplate && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {previewTemplate.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Mise en page:
                </Typography>
                {renderTemplatePreview(previewTemplate)}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Image />}
                  label={`Maximum ${previewTemplate.maxImages} image${previewTemplate.maxImages > 1 ? 's' : ''}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<TextFields />}
                  label={`Maximum ${previewTemplate.maxTextBlocks} bloc${previewTemplate.maxTextBlocks > 1 ? 's' : ''} de texte`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  icon={<PhotoLibrary />}
                  label="Images personnalisées supportées"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Fermer
          </Button>
          {previewTemplate && (
            <Button
              variant="contained"
              onClick={() => {
                onTemplateSelect(previewTemplate.id);
                setPreviewOpen(false);
              }}
              disabled={disabled}
            >
              Utiliser ce modèle
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BlogTemplateSelector;
