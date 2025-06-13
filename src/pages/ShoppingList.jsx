/**
 * Shopping List Page
 * Main page for shopping list management with generation and interaction features
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add,
  GetApp,
  Share,
  Print,
  Refresh,
  ShoppingCart,
  CheckCircle,
  Schedule,
  CalendarMonth,
  Email,
  Send,
  AttachFile,
  CloudDownload,
  PictureAsPdf,
  Kitchen,
  Clear,
  RemoveShoppingCart,
  Notifications
} from '@mui/icons-material';
import { useShoppingList } from '../contexts/ShoppingListContext.jsx';
import { useRecipes } from '../contexts/RecipeContext.jsx';
import { useMealPlan } from '../contexts/MealPlanContext.jsx';
import { useFamily } from '../contexts/FirestoreFamilyContext.jsx';
import { usePantry } from '../contexts/PantryContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import CategorySection from '../components/shopping/CategorySection.jsx';
import SellerDiscovery from '../components/shopping/SellerDiscovery.jsx';
import SellerResponses from '../components/shopping/SellerResponses.jsx';
import { GROCERY_CATEGORIES } from '../types/shoppingList.js';

function ShoppingList() {
  const {
    currentShoppingList,
    loading,
    error,
    generateNewShoppingList,
    toggleItemCompletion,
    updateItemNotes,
    toggleCategoryCompletion,
    clearCompletedItems,
    clearCompletedItemsInCategory,
    getShoppingListStats,
    exportShoppingList,
    shareWithFamilyEmail,
    shareWithFamilyEmailAttachment,
    downloadShoppingListFile,
    deductPantryFromShoppingList,
    clearPantryDeductions
  } = useShoppingList();

  const { getAllRecipes } = useRecipes();
  const { mealPlan, hasMeals, getMealPlanStats } = useMealPlan();
  const { family, familyMembers } = useFamily();
  const { pantryItems } = usePantry();
  const { showNotification } = useNotification();

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [sellerDiscoveryOpen, setSellerDiscoveryOpen] = useState(false);
  const [sellerResponsesOpen, setSellerResponsesOpen] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    familySize: 4,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '',
    includePantryCheck: false
  });
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);

  const mealPlanStats = getMealPlanStats();

  const stats = getShoppingListStats();

  const handleGenerateShoppingList = async () => {
    try {
      await generateNewShoppingList(mealPlan, getAllRecipes(), generationOptions);
      setGenerateDialogOpen(false);
    } catch (error) {
      console.error('Failed to generate shopping list:', error);
    }
  };

  const handleDeductPantry = async () => {
    try {
      const result = deductPantryFromShoppingList(pantryItems);
      if (result.success) {
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'warning');
      }
    } catch (error) {
      console.error('Error deducting pantry:', error);
      showNotification('Erreur lors de la déduction du garde-manger', 'error');
    }
  };

  const handleClearPantryDeductions = async () => {
    try {
      const result = clearPantryDeductions();
      if (result.success) {
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'warning');
      }
    } catch (error) {
      console.error('Error clearing pantry deductions:', error);
      showNotification('Erreur lors de l\'effacement des déductions', 'error');
    }
  };

  const handleExport = (format) => {
    const exported = exportShoppingList(format);

    if (format === 'text') {
      // Create downloadable text file
      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liste-courses-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Copy to clipboard for JSON
      navigator.clipboard.writeText(exported);
    }
  };

  const handlePrint = () => {
    const printContent = exportShoppingList('text');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste de Courses - MiamBidi</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #2E7D32;
              text-align: center;
            }
            pre {
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #2E7D32; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimer / Sauvegarder en PDF
            </button>
          </div>
          <pre>${printContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShareWithFamily = async () => {
    setShareLoading(true);
    setShareMessage(null);

    try {
      // Extract email addresses from family members
      // Check both familyMembers array and family.members for compatibility
      const members = familyMembers || family?.members || [];
      const familyEmails = members
        .filter(member => member.email && member.email.trim() !== '')
        .map(member => member.email.trim());

      console.log('Family members found:', members.length);
      console.log('Valid email addresses:', familyEmails.length);

      // Enhanced family data for email personalization
      const familyData = {
        name: family?.name || 'Votre Famille',
        memberCount: members.length,
        emailCount: familyEmails.length
      };

      const result = shareWithFamilyEmailAttachment(familyEmails, familyData);

      console.log('Email sharing result:', result);

      setShareMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });

      // Additional feedback for successful file download
      if (result.success && result.filename) {
        setTimeout(() => {
          setShareMessage({
            type: 'info',
            text: `Fichier "${result.filename}" téléchargé. Vérifiez que votre client email s'est ouvert avec les instructions.`
          });
        }, 3000);
      }

      // Clear message after 6 seconds for longer messages
      setTimeout(() => {
        setShareMessage(null);
      }, 6000);

    } catch (error) {
      console.error('Error sharing shopping list:', error);
      setShareMessage({
        type: 'error',
        text: 'Erreur lors du partage de la liste de courses. Vérifiez votre connexion et réessayez.'
      });

      setTimeout(() => {
        setShareMessage(null);
      }, 6000);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Liste de Courses 🛒
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Générez automatiquement votre liste de courses à partir de vos repas planifiés
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Share Message Alert */}
      {shareMessage && (
        <Alert severity={shareMessage.type} sx={{ mb: 3 }}>
          {shareMessage.text}
        </Alert>
      )}

      {/* No Shopping List State */}
      {!currentShoppingList && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Aucune liste de courses active
          </Typography>

          {!hasMeals() ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Aucun repas planifié. Allez au calendrier pour planifier vos repas.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CalendarMonth />}
                onClick={() => window.location.href = '/calendar'}
              >
                Aller au calendrier
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Générez une nouvelle liste de courses à partir de vos repas planifiés
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {mealPlanStats.totalMeals} repas planifiés • {mealPlanStats.uniqueRecipes} recettes uniques
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setGenerateDialogOpen(true)}
                >
                  Générer une liste de courses
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => handleGenerateShoppingList()}
                  disabled={loading}
                >
                  {loading ? 'Génération...' : 'Génération rapide'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Shopping List Content */}
      {currentShoppingList && !loading && (
        <>
          {/* Shopping List Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {currentShoppingList.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Créé le {new Date(currentShoppingList.createdAt).toLocaleDateString('fr-FR')}
                  {currentShoppingList.lastModified !== currentShoppingList.createdAt && (
                    <> • Modifié le {new Date(currentShoppingList.lastModified).toLocaleDateString('fr-FR')}</>
                  )}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={() => setGenerateDialogOpen(true)}
                >
                  Régénérer
                </Button>
                <Tooltip
                  title={
                    (!familyMembers?.some(m => m.email) && !family?.members?.some(m => m.email))
                      ? "Aucune adresse email trouvée dans votre famille. Ajoutez des emails aux profils des membres."
                      : "Télécharge la liste de courses et ouvre votre client email avec instructions pour joindre le fichier"
                  }
                  arrow
                >
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={shareLoading ? <CircularProgress size={16} color="inherit" /> : <AttachFile />}
                      onClick={handleShareWithFamily}
                      disabled={shareLoading || (!familyMembers?.some(m => m.email) && !family?.members?.some(m => m.email))}
                      sx={{
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'grey.300' }
                      }}
                    >
                      {shareLoading ? 'Téléchargement...' : 'Envoyer avec Pièce Jointe'}
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudDownload />}
                  onClick={() => {
                    const familyData = {
                      name: family?.name || 'Votre Famille',
                      memberCount: (familyMembers || family?.members || []).length,
                      emailCount: (familyMembers || family?.members || []).filter(m => m.email).length
                    };
                    const result = downloadShoppingListFile(familyData);
                    if (result.success) {
                      setShareMessage({
                        type: 'success',
                        text: result.message
                      });
                      setTimeout(() => setShareMessage(null), 4000);
                    }
                  }}
                >
                  Télécharger
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GetApp />}
                  onClick={() => handleExport('text')}
                >
                  Exporter Simple
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PictureAsPdf />}
                  onClick={handlePrint}
                >
                  Exporter PDF
                </Button>
              </Box>
            </Box>

            {/* Statistics */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<ShoppingCart />}
                label={`${stats.totalItems} articles`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle />}
                label={`${stats.completedItems} achetés`}
                color="success"
                variant={stats.completedItems > 0 ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<Schedule />}
                label={`${stats.totalRecipes} recettes`}
                color="secondary"
                variant="outlined"
              />
              {stats.completionPercentage > 0 && (
                <Chip
                  label={`${stats.completionPercentage}% terminé`}
                  color={stats.completionPercentage === 100 ? 'success' : 'warning'}
                  variant="filled"
                />
              )}
            </Box>

            {/* Pantry Deduction Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDeductPantry}
                size="small"
                startIcon={<Kitchen />}
                disabled={!pantryItems || pantryItems.length === 0}
              >
                Déduire du garde-manger
              </Button>

              {currentShoppingList.pantryDeductionApplied && (
                <Button
                  variant="text"
                  color="warning"
                  onClick={handleClearPantryDeductions}
                  size="small"
                  startIcon={<Clear />}
                >
                  Effacer les déductions du garde-manger
                </Button>
              )}
            </Box>

            {/* Seller Marketplace Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => setSellerDiscoveryOpen(true)}
                size="small"
                startIcon={<Send />}
                sx={{
                  bgcolor: '#d2eb34',
                  color: 'black',
                  '&:hover': { bgcolor: '#b8d62f' }
                }}
              >
                Envoyer à un vendeur
              </Button>

              <Button
                variant="outlined"
                onClick={() => setSellerResponsesOpen(true)}
                size="small"
                startIcon={<Notifications />}
                sx={{
                  borderColor: '#d2eb34',
                  color: '#d2eb34',
                  '&:hover': {
                    borderColor: '#b8d62f',
                    bgcolor: '#d2eb3410'
                  }
                }}
              >
                Réponses des vendeurs
              </Button>
            </Box>

            {/* Clear Completed Button */}
            {stats.completedItems > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={clearCompletedItems}
                  size="small"
                  startIcon={<RemoveShoppingCart />}
                >
                  Effacer les articles achetés ({stats.completedItems})
                </Button>
              </Box>
            )}
          </Paper>

          {/* Categories */}
          <Box>
            {Object.entries(GROCERY_CATEGORIES).map(([category, categoryInfo]) => {
              const items = currentShoppingList.categories[category] || [];
              return (
                <CategorySection
                  key={category}
                  category={category}
                  items={items}
                  onToggleItemCompletion={toggleItemCompletion}
                  onUpdateItemNotes={updateItemNotes}
                  onToggleCategoryCompletion={toggleCategoryCompletion}
                  onClearCompletedInCategory={clearCompletedItemsInCategory}
                  expanded={true}
                />
              );
            })}
          </Box>
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="generate shopping list"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setGenerateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Generation Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Générer une liste de courses</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Titre de la liste"
              value={generationOptions.title}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Liste de courses - Semaine du..."
              fullWidth
            />

            <TextField
              label="Taille de la famille"
              type="number"
              value={generationOptions.familySize}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, familySize: parseInt(e.target.value) }))}
              inputProps={{ min: 1, max: 20 }}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date de début"
                type="date"
                value={generationOptions.startDate}
                onChange={(e) => setGenerationOptions(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Date de fin"
                type="date"
                value={generationOptions.endDate}
                onChange={(e) => setGenerationOptions(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={generationOptions.includePantryCheck}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, includePantryCheck: e.target.checked }))}
                />
              }
              label="Vérifier le garde-manger (fonctionnalité future)"
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleGenerateShoppingList} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Générer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Seller Discovery Dialog */}
      <SellerDiscovery
        open={sellerDiscoveryOpen}
        onClose={() => setSellerDiscoveryOpen(false)}
        shoppingListItems={currentShoppingList ?
          Object.values(currentShoppingList.categories).flat() : []
        }
      />

      {/* Seller Responses Dialog */}
      <SellerResponses
        open={sellerResponsesOpen}
        onClose={() => setSellerResponsesOpen(false)}
      />
    </Box>
  );
}

export default ShoppingList;
