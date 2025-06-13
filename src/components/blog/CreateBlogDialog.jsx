/**
 * Create Blog Dialog Component
 * Complete blog creation workflow with template selection and content editing
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Grid,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close,
  ArrowBack,
  ArrowForward,
  Preview,
  Publish,
  Save
} from '@mui/icons-material';
import BlogTemplateSelector from './BlogTemplateSelector';
import BlogContentEditor from './BlogContentEditor';
import BlogPreview from './BlogPreview';
import { useBlog } from '../../contexts/BlogContext';
import {
  DEFAULT_BLOG,
  BLOG_STATUS,
  BLOG_VISIBILITY,
  BLOG_VALIDATION,
  BLOG_TAGS
} from '../../types/blog';

const steps = [
  'Informations de base',
  'Sélection du modèle',
  'Contenu de l\'article',
  'Aperçu et publication'
];

function CreateBlogDialog({ open, onClose }) {
  const { createBlog, loading } = useBlog();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    ...DEFAULT_BLOG,
    template: 'template-a',
    content: {}
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      ...DEFAULT_BLOG,
      template: 'template-a',
      content: {}
    });
    setErrors({});
    setTouched({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.title || formData.title.length < BLOG_VALIDATION.title.minLength) {
          newErrors.title = `Le titre doit contenir au moins ${BLOG_VALIDATION.title.minLength} caractères`;
        }
        if (formData.title && formData.title.length > BLOG_VALIDATION.title.maxLength) {
          newErrors.title = `Le titre ne peut pas dépasser ${BLOG_VALIDATION.title.maxLength} caractères`;
        }
        if (formData.excerpt && formData.excerpt.length > BLOG_VALIDATION.excerpt.maxLength) {
          newErrors.excerpt = `L'extrait ne peut pas dépasser ${BLOG_VALIDATION.excerpt.maxLength} caractères`;
        }
        break;
        
      case 1: // Template Selection
        if (!formData.template) {
          newErrors.template = 'Veuillez sélectionner un modèle';
        }
        break;
        
      case 2: // Content
        if (formData.template === 'template-a') {
          if (!formData.content.heroImage?.url) {
            newErrors.heroImage = 'L\'image héros est requise';
          }
          if (!formData.content.mainText || formData.content.mainText.length < 50) {
            newErrors.mainText = 'Le texte principal doit contenir au moins 50 caractères';
          }
        }
        // Add validation for other templates as needed
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleTagToggle = (tag) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleInputChange('tags', newTags);
  };

  const handleSaveDraft = async () => {
    try {
      await createBlog({
        ...formData,
        status: BLOG_STATUS.DRAFT
      });
      handleClose();
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handlePublish = async () => {
    if (!validateCurrentStep()) return;
    
    try {
      await createBlog({
        ...formData,
        status: BLOG_STATUS.PUBLISHED
      });
      handleClose();
    } catch (error) {
      console.error('Error publishing blog:', error);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informations de Base
            </Typography>
            
            <TextField
              fullWidth
              label="Titre de l'article"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title || `${formData.title.length}/${BLOG_VALIDATION.title.maxLength} caractères`}
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Extrait (optionnel)"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              error={!!errors.excerpt}
              helperText={errors.excerpt || `Résumé court pour l'aperçu (${formData.excerpt.length}/${BLOG_VALIDATION.excerpt.maxLength})`}
              sx={{ mb: 3 }}
            />
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Visibilité</FormLabel>
              <RadioGroup
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                row
              >
                <FormControlLabel
                  value={BLOG_VISIBILITY.PUBLIC}
                  control={<Radio />}
                  label="Public (visible par tous)"
                />
                <FormControlLabel
                  value={BLOG_VISIBILITY.PREMIUM}
                  control={<Radio />}
                  label="Premium (utilisateurs connectés uniquement)"
                />
              </RadioGroup>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags (optionnel)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {BLOG_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagToggle(tag)}
                    color={formData.tags?.includes(tag) ? 'primary' : 'default'}
                    variant={formData.tags?.includes(tag) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <BlogTemplateSelector
              selectedTemplate={formData.template}
              onTemplateSelect={(template) => {
                handleInputChange('template', template);
                // Reset content when template changes
                handleInputChange('content', {});
              }}
            />
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <BlogContentEditor
              template={formData.template}
              content={formData.content}
              onContentChange={(content) => handleInputChange('content', content)}
              errors={errors}
            />
          </Box>
        );
        
      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aperçu de l'Article
            </Typography>
            <BlogPreview
              title={formData.title}
              template={formData.template}
              content={formData.content}
              excerpt={formData.excerpt}
              tags={formData.tags}
              visibility={formData.visibility}
            />
          </Box>
        );
        
      default:
        return 'Étape inconnue';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Créer un Nouvel Article
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {activeStep === 3 && (
              <Button
                onClick={handleSaveDraft}
                startIcon={<Save />}
                disabled={loading}
              >
                Sauvegarder comme Brouillon
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                startIcon={<ArrowBack />}
                disabled={loading}
              >
                Précédent
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={loading}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handlePublish}
                startIcon={<Publish />}
                disabled={loading}
                color="success"
              >
                Publier l'Article
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default CreateBlogDialog;
