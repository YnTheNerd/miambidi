import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Rating,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Close,
  AccessTime,
  Group,
  Restaurant,
  CheckCircle,
  LocalDining,
  Favorite,
  FavoriteBorder,
  Share,
  Edit,
  ShoppingCart,
  Print,
  Email,
  PictureAsPdf,
  Download
} from '@mui/icons-material';
import { generateRecipePDF, downloadRecipePDF } from '../../services/pdfService';
import { shareRecipeWithPDF, validateEmailAddresses } from '../../services/recipeEmailService';
import { useFamily } from '../../contexts/FirestoreFamilyContext';

function RecipeDialog({
  open,
  recipe,
  onClose,
  currentUserId,
  onEdit,
  onAddToShoppingList,
  isFavorite,
  onToggleFavorite
}) {
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState(new Set());

  // PDF and Email sharing states
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState('');
  const [shareMessage, setShareMessage] = useState(null);
  const [shareProgress, setShareProgress] = useState('');

  // Get family context for email sharing and admin permissions
  const { currentFamily, familyMembers, currentUser } = useFamily();

  if (!recipe) return null;

  const handleToggleIngredient = (index) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleToggleInstruction = (index) => {
    setCheckedInstructions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'success';
      case 'Moyen': return 'warning';
      case 'Difficile': return 'error';
      default: return 'default';
    }
  };

  const getDietaryInfo = () => {
    const info = [];
    const dietaryInfo = recipe.dietaryInfo || {};
    if (dietaryInfo.isVegetarian) info.push('Végétarien');
    if (dietaryInfo.isVegan) info.push('Végan');
    if (dietaryInfo.isGlutenFree) info.push('Sans Gluten');
    if (dietaryInfo.isDairyFree) info.push('Sans Produits Laitiers');
    if (dietaryInfo.containsNuts) info.push('Contient des Noix');
    return info;
  };

  // PDF Generation Handler
  const handlePrintRecipe = async () => {
    if (!recipe) return;

    setPdfLoading(true);
    setShareProgress('Génération du PDF...');

    try {
      const pdfResult = await generateRecipePDF(recipe);

      if (pdfResult.success) {
        const downloadResult = downloadRecipePDF(pdfResult);

        if (downloadResult.success) {
          setShareMessage({
            type: 'success',
            text: `PDF "${pdfResult.filename}" téléchargé avec succès !`
          });
        } else {
          setShareMessage({
            type: 'error',
            text: downloadResult.message
          });
        }
      } else {
        setShareMessage({
          type: 'error',
          text: 'Erreur lors de la génération du PDF'
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setShareMessage({
        type: 'error',
        text: `Erreur: ${error.message}`
      });
    } finally {
      setPdfLoading(false);
      setShareProgress('');
    }
  };

  // Share Menu Handlers
  const handleShareMenuOpen = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  const handleShareMenuClose = () => {
    setShareMenuAnchor(null);
  };

  // Email Sharing Handler
  const handleEmailShare = async () => {
    if (!emailAddresses.trim()) {
      setShareMessage({
        type: 'error',
        text: 'Veuillez entrer au moins une adresse email'
      });
      return;
    }

    const emails = emailAddresses.split(',').map(email => email.trim());
    const validation = validateEmailAddresses(emails);

    if (!validation.isValid) {
      setShareMessage({
        type: 'error',
        text: `Adresses email invalides: ${validation.invalidEmails.join(', ')}`
      });
      return;
    }

    setShareLoading(true);
    setEmailDialogOpen(false);
    setShareProgress('Génération du PDF et de l\'email...');

    try {
      const familyData = currentFamily ? {
        name: currentFamily.name,
        id: currentFamily.id
      } : null;

      const result = await shareRecipeWithPDF(recipe, validation.validEmails, familyData);

      if (result.success) {
        setShareMessage({
          type: 'success',
          text: result.message
        });
      } else {
        setShareMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      setShareMessage({
        type: 'error',
        text: `Erreur lors du partage: ${error.message}`
      });
    } finally {
      setShareLoading(false);
      setShareProgress('');
    }
  };

  // Get family member emails for quick selection
  const getFamilyEmails = () => {
    if (!familyMembers || familyMembers.length === 0) return [];
    return familyMembers
      .filter(member => member.email && member.uid !== currentUserId)
      .map(member => member.email);
  };

  const handleQuickEmailSelect = () => {
    const familyEmails = getFamilyEmails();
    if (familyEmails.length > 0) {
      setEmailAddresses(familyEmails.join(', '));
    }
    setEmailDialogOpen(true);
    handleShareMenuClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Restaurant color="primary" />
            <Typography variant="h5" component="div">
              {recipe.name}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={() => onToggleFavorite(recipe.id)}>
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Recipe Image */}
        <Box sx={{ mb: 3 }}>
          <Paper
            sx={{
              height: 250,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${recipe.imageUrl || recipe.image || '/images/recipes/default-meal.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >

          </Paper>
        </Box>

        {/* Recipe Meta Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Temps Total
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Portions
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {recipe.servings || 1} personnes
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Difficulté
              </Typography>
              <Chip
                label={recipe.difficulty || 'Non spécifié'}
                size="small"
                sx={{
                  bgcolor: '#ffffff',
                  color: '#ff9800',
                  fontWeight: 'bold',
                  border: '1px solid #ff9800'
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={recipe.rating || 0} precision={0.1} size="small" readOnly />
              <Typography variant="body2" color="text.secondary">
                ({recipe.reviews || 0})
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Description */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          {recipe.description}
        </Typography>

        {/* Categories and Dietary Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informations
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Cuisine & Catégories
            </Typography>
            <Chip label={recipe.cuisine || 'Non spécifié'} color="primary" sx={{ mr: 1, mb: 1 }} />
            {(recipe.categories || []).map((category) => (
              <Chip
                key={category}
                label={category}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          {getDietaryInfo().length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Informations Diététiques
              </Typography>
              {getDietaryInfo().map((info) => (
                <Chip
                  key={info}
                  label={info}
                  color="success"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Ingredients */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ingrédients
          </Typography>
          <List dense>
            {(recipe.ingredients || []).map((ingredient, index) => (
              <ListItem
                key={index}
                sx={{
                  pl: 0,
                  textDecoration: checkedIngredients.has(index) ? 'line-through' : 'none',
                  opacity: checkedIngredients.has(index) ? 0.6 : 1
                }}
              >
                <ListItemIcon>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleIngredient(index)}
                  >
                    <CheckCircle
                      color={checkedIngredients.has(index) ? 'success' : 'action'}
                    />
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={`${ingredient.quantity || ''} ${ingredient.unit || ''} ${ingredient.name || 'Ingrédient'}`}
                  secondary={ingredient.category || ''}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Instructions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <List>
            {(recipe.instructions || []).map((instruction, index) => (
              <ListItem
                key={index}
                sx={{
                  pl: 0,
                  alignItems: 'flex-start',
                  textDecoration: checkedInstructions.has(index) ? 'line-through' : 'none',
                  opacity: checkedInstructions.has(index) ? 0.6 : 1
                }}
              >
                <ListItemIcon sx={{ mt: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleInstruction(index)}
                  >
                    <CheckCircle
                      color={checkedInstructions.has(index) ? 'success' : 'action'}
                    />
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      <strong>Étape {index + 1}:</strong> {instruction || 'Instruction non spécifiée'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conseils
            </Typography>
            <List dense>
              {recipe.tips.map((tip, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <LocalDining color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Nutrition Information */}
        {recipe.nutrition && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informations Nutritionnelles (par portion)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Calories</TableCell>
                    <TableCell>Protéines</TableCell>
                    <TableCell>Glucides</TableCell>
                    <TableCell>Lipides</TableCell>
                    <TableCell>Fibres</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{recipe.nutrition?.calories || 0} kcal</TableCell>
                    <TableCell>{recipe.nutrition?.protein || 0} g</TableCell>
                    <TableCell>{recipe.nutrition?.carbs || 0} g</TableCell>
                    <TableCell>{recipe.nutrition?.fat || 0} g</TableCell>
                    <TableCell>{recipe.nutrition?.fiber || 0} g</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          startIcon={<ShoppingCart />}
          onClick={() => onAddToShoppingList(recipe)}
        >
          Ajouter à la Liste
        </Button>

        {/*
          Future Meal Planning Integration:
          <Button
            startIcon={<CalendarMonth />}
            onClick={() => onPlanMeal(recipe)}
          >
            Planifier ce Repas
          </Button>
          - Opens meal planning dialog
          - Allows selection of date and meal type
          - Integrates with RecipeContext.planMealForDate()
        */}

        <Button
          startIcon={<Share />}
          onClick={handleShareMenuOpen}
          disabled={shareLoading}
        >
          Partager
        </Button>

        <Button
          startIcon={pdfLoading ? <CircularProgress size={16} /> : <Print />}
          onClick={handlePrintRecipe}
          disabled={pdfLoading || shareLoading}
        >
          {pdfLoading ? 'Génération...' : 'Imprimer'}
        </Button>

        {(() => {
          const isCreator = currentUserId === recipe.createdBy;
          const canEditByOwnership = recipe.ownership?.canEdit?.includes(currentUserId) || false;

          // Get admin status from family context
          const isAdmin = currentUser?.role === 'admin';
          const currentFamilyId = currentFamily?.id;

          // NEW: Family admins can edit ANY recipe created by their family members
          const canEditAsAdmin = isAdmin && currentFamilyId && (
            (recipe.familyId === currentFamilyId) ||
            (recipe.visibility === 'public' && isAdmin)
          );

          // MiamBidi Requirements: Family admins can edit ALL recipes (including private imported ones)
          const canEdit = isCreator || canEditByOwnership || canEditAsAdmin;

          return canEdit ? (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => onEdit(recipe)}
            >
              Modifier
            </Button>
          ) : null;
        })()}

        <Button onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={handleShareMenuClose}
      >
        <MenuItem onClick={handleQuickEmailSelect}>
          <Email sx={{ mr: 1 }} />
          Partager par Email
        </MenuItem>
        <MenuItem onClick={() => { setEmailDialogOpen(true); handleShareMenuClose(); }}>
          <Email sx={{ mr: 1 }} />
          Email Personnalisé
        </MenuItem>
        <MenuItem onClick={handlePrintRecipe}>
          <PictureAsPdf sx={{ mr: 1 }} />
          Télécharger PDF
        </MenuItem>
      </Menu>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Partager la Recette par Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Entrez les adresses email séparées par des virgules
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Adresses Email"
            value={emailAddresses}
            onChange={(e) => setEmailAddresses(e.target.value)}
            placeholder="exemple@email.com, autre@email.com"
            helperText={`${getFamilyEmails().length} membre(s) de famille disponible(s)`}
          />
          {getFamilyEmails().length > 0 && (
            <Button
              size="small"
              onClick={() => setEmailAddresses(getFamilyEmails().join(', '))}
              sx={{ mt: 1 }}
            >
              Utiliser les emails de la famille
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleEmailShare}
            variant="contained"
            disabled={!emailAddresses.trim() || shareLoading}
            startIcon={shareLoading ? <CircularProgress size={16} /> : <Email />}
          >
            {shareLoading ? 'Envoi...' : 'Partager'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress and Messages */}
      {shareProgress && (
        <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 9999 }}>
          <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            {shareProgress}
          </Alert>
        </Box>
      )}

      {/* Share Messages */}
      <Snackbar
        open={Boolean(shareMessage)}
        autoHideDuration={6000}
        onClose={() => setShareMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShareMessage(null)}
          severity={shareMessage?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {shareMessage?.text}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default RecipeDialog;
