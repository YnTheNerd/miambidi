import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Card,
  Drawer,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Search,
  Restaurant,
  CalendarMonth,
  Delete,
  Warning,
  GetApp,
  PictureAsPdf,
  FileDownload,
} from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useRecipes } from '../../contexts/RecipeContext';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useMealPlan } from '../../contexts/MealPlanContext';

// French day names
const FRENCH_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MEAL_TYPES = ["Petit-déjeuner", "Déjeuner", "Dîner"];

// Draggable Recipe Item Component
function DraggableRecipe({ recipe }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recipe.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1,
        cursor: 'grab',
        '&:hover': { boxShadow: 3 },
        '&:active': { cursor: 'grabbing' },
        userSelect: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <Avatar
          src={recipe.imageUrl || recipe.image || '/images/recipes/default-meal.jpg'}
          alt={recipe.name}
          sx={{ width: 40, height: 40, mr: 2 }}
        >
          <Restaurant />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {recipe.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {recipe.prepTime + recipe.cookTime} min • {recipe.servings} portions
          </Typography>
        </Box>
        <Chip
          label={recipe.difficulty}
          size="small"
          sx={{
            bgcolor: '#ffffff',
            color: '#ff9800',
            fontWeight: 'bold',
            border: '1px solid #ff9800'
          }}
        />
      </Box>
    </Card>
  );
}

// Droppable Meal Slot Component
function MealSlot({ day, mealType, plannedMeal, onRemoveMeal, familyConflicts }) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `${day}-${mealType}`,
    data: {
      type: 'meal-slot',
      day,
      mealType,
    },
  });

  const hasConflicts = familyConflicts && familyConflicts.length > 0;

  return (
    <Paper
      ref={setNodeRef}
      elevation={isOver ? 4 : plannedMeal ? 2 : 1}
      sx={{
        height: { xs: '120px', sm: '130px' },
        p: { xs: 1, sm: 1.5 },
        border: isOver
          ? '2px dashed #1976d2'
          : plannedMeal
            ? '1px solid #e0e0e0'
            : '2px dashed #e0e0e0',
        bgcolor: isOver
          ? 'primary.50'
          : plannedMeal
            ? 'background.paper'
            : 'grey.50',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        cursor: plannedMeal ? 'default' : 'pointer',
        '&:hover': {
          elevation: plannedMeal ? 3 : 2,
          bgcolor: isOver
            ? 'primary.100'
            : plannedMeal
              ? 'background.paper'
              : 'grey.100'
        }
      }}
    >
      {plannedMeal ? (
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5
          }}>
            <Avatar
              src={plannedMeal.recipe.imageUrl || plannedMeal.recipe.image || '/images/recipes/default-meal.jpg'}
              alt={plannedMeal.recipe.name}
              sx={{ width: 24, height: 24 }}
            >
              <Restaurant fontSize="small" />
            </Avatar>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {hasConflicts && (
                <Tooltip title={`Conflits: ${familyConflicts.join(', ')}`}>
                  <Warning color="warning" fontSize="small" />
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={() => onRemoveMeal(day, mealType)}
                sx={{
                  p: 0.25,
                  '&:hover': { bgcolor: 'error.50' }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{
              textAlign: 'center',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5
            }}
          >
            {plannedMeal.recipe.name}
          </Typography>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 500
              }}
            >
              {plannedMeal.recipe.prepTime + plannedMeal.recipe.cookTime} min
            </Typography>

            <Typography
              variant="caption"
              color="primary.main"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 'bold',
                bgcolor: 'primary.50',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5
              }}
            >
              {plannedMeal.recipe.servings} portions
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{
          textAlign: 'center',
          color: 'text.secondary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <Add sx={{ fontSize: 28, mb: 0.5, opacity: 0.6 }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 500,
              opacity: 0.8
            }}
          >
            Glisser un repas ici
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function DragDropMealCalendar() {
  const { getAllRecipes, loading: recipesLoading, error: recipesError } = useRecipes();
  const { familyMembers, loading: familyLoading, error: familyError } = useFamily();
  const {
    mealPlan,
    currentWeek,
    planMeal,
    removeMeal,
    updateCurrentWeek,
    navigateWeek: contextNavigateWeek
  } = useMealPlan();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Combined loading and error states
  const isLoading = recipesLoading || familyLoading;
  const error = recipesError || familyError;

  console.log('DragDropMealCalendar rendering with', getAllRecipes().length, 'recipes');

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Box sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Chargement du calendrier...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Récupération des recettes et données de famille
        </Typography>
      </Box>
    );
  }

  // Handle case where family data is not available
  if (!familyMembers) {
    return (
      <Box sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Données familiales requises
          </Typography>
          <Typography variant="body2">
            Vous devez faire partie d'une famille pour accéder au calendrier de planification des repas.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/dashboard'}
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      </Box>
    );
  }

  // Drag and drop sensors with improved configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get all recipes for the sidebar
  const allRecipes = getAllRecipes();
  const filteredRecipes = allRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate week dates
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const recipeId = active.id;
    const recipe = allRecipes.find(r => r.id === recipeId);

    if (over.data.current?.type === 'meal-slot') {
      const { day, mealType } = over.data.current;
      planMeal(day, mealType, recipe);
    }
  };

  // Remove meal from calendar
  const handleRemoveMeal = (day, mealType) => {
    removeMeal(day, mealType);
  };

  // Navigate weeks
  const navigateWeek = (direction) => {
    contextNavigateWeek(direction);
  };

  // Export functionality
  const generateCalendarContent = () => {
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];

    let content = '';
    content += `═══════════════════════════════════════\n`;
    content += `        PLANNING REPAS MIAMBIDI\n`;
    content += `═══════════════════════════════════════\n\n`;

    content += `📅 Semaine du ${weekStart.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })} au ${weekEnd.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}\n`;

    content += `👨‍👩‍👧‍👦 Famille: ${familyMembers?.[0]?.displayName || 'Votre Famille'}\n`;
    content += `📧 Exporté le: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

    // Add meals for each day
    weekDates.forEach((date, dayIndex) => {
      const dayName = FRENCH_DAYS[dayIndex];
      content += `\n🗓️  ${dayName.toUpperCase()} - ${date.toLocaleDateString('fr-FR')}\n`;
      content += `${'─'.repeat(50)}\n`;

      let dayHasMeals = false;
      MEAL_TYPES.forEach((mealType) => {
        const dateKey = `${date.toDateString()}-${mealType}`;
        const plannedMeal = mealPlan[dateKey];

        if (plannedMeal) {
          dayHasMeals = true;
          const mealIcon = mealType === 'Petit-déjeuner' ? '🌅' :
                          mealType === 'Déjeuner' ? '🌞' : '🌙';

          content += `${mealIcon} ${mealType}:\n`;
          content += `   📖 ${plannedMeal.recipe.name}\n`;
          content += `   ⏱️  ${plannedMeal.recipe.prepTime + plannedMeal.recipe.cookTime} minutes\n`;
          content += `   👥 ${plannedMeal.recipe.servings} portions\n`;
          content += `   🏷️  ${plannedMeal.recipe.difficulty}\n\n`;
        }
      });

      if (!dayHasMeals) {
        content += `   Aucun repas planifié\n\n`;
      }
    });

    content += `\n═══════════════════════════════════════\n`;
    content += `🍽️ Bon appétit et bonne planification !\n\n`;
    content += `---\n`;
    content += `Ce planning a été généré automatiquement par MiamBidi\n`;
    content += `Application de planification de repas pour familles\n`;
    content += `💚 Mangez bien, planifiez mieux !\n`;

    return content;
  };

  const handleExportText = () => {
    const content = generateCalendarContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-repas-${weekDates[0].toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // For now, we'll create a print-friendly version
    // In a real implementation, you'd use a library like jsPDF or react-pdf
    const content = generateCalendarContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Planning Repas - MiamBidi</title>
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
          <pre>${content}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Calendrier de Planification des Repas 🗓️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Planifiez vos repas en glissant-déposant vos recettes favorites
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{
          display: 'flex',
          gap: 2,
          minHeight: 'calc(100vh - 200px)',
          bgcolor: 'background.default'
        }}>
          {/* Recipe Sidebar */}
          {drawerOpen && (
            <Paper
              elevation={2}
              sx={{
                width: 350,
                flexShrink: 0,
                p: 2,
                borderRadius: 2,
                height: 'fit-content',
                maxHeight: 'calc(100vh - 250px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recettes Disponibles
                </Typography>
                <IconButton onClick={() => setDrawerOpen(false)} size="small">
                  <ChevronLeft />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher des recettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <SortableContext items={filteredRecipes.map(r => r.id)} strategy={verticalListSortingStrategy}>
                <Box sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  maxHeight: 'calc(100vh - 400px)',
                  pr: 1
                }}>
                  {filteredRecipes.map((recipe) => (
                    <DraggableRecipe key={recipe.id} recipe={recipe} />
                  ))}
                  {filteredRecipes.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Aucune recette trouvée
                    </Typography>
                  )}
                </Box>
              </SortableContext>
            </Paper>
          )}

          {/* Main Calendar Area */}
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Calendar Header */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!drawerOpen && (
                    <Button
                      variant="outlined"
                      startIcon={<Restaurant />}
                      onClick={() => setDrawerOpen(true)}
                      size="small"
                    >
                      Recettes
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={() => navigateWeek(-1)}>
                    <ChevronLeft />
                  </IconButton>

                  <Typography variant="h6" sx={{ minWidth: 250, textAlign: 'center' }}>
                    Semaine du {weekDates[0].toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>

                  <IconButton onClick={() => navigateWeek(1)}>
                    <ChevronRight />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<GetApp />}
                    onClick={() => setExportDialogOpen(true)}
                    size="small"
                    sx={{
                      bgcolor: 'success.main',
                      '&:hover': { bgcolor: 'success.dark' }
                    }}
                  >
                    Télécharger
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={handleExportPDF}
                    size="small"
                  >
                    Exporter simple
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<CalendarMonth />}
                    onClick={() => updateCurrentWeek(new Date())}
                    size="small"
                  >
                    Aujourd'hui
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Calendar Grid */}
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Day Headers */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {weekDates.map((date, index) => (
                    <Box key={`header-${index}`} sx={{ flex: 1 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {FRENCH_DAYS[index]}
                        </Typography>
                        <Typography variant="body2">
                          {date.getDate()}/{date.getMonth() + 1}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>

                {/* Meal Rows */}
                {MEAL_TYPES.map((mealType) => (
                  <Box key={mealType}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      {mealType}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {weekDates.map((date, dayIndex) => {
                        const dateKey = `${date.toDateString()}-${mealType}`;
                        const plannedMeal = mealPlan[dateKey];

                        return (
                          <Box key={dateKey} sx={{ flex: 1 }}>
                            <MealSlot
                              day={date.toDateString()}
                              mealType={mealType}
                              plannedMeal={plannedMeal}
                              onRemoveMeal={handleRemoveMeal}
                              familyConflicts={[]} // TODO: Add conflict detection
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={null}
          style={{
            cursor: 'grabbing',
            zIndex: 9999,
          }}
        >
          {activeId ? (
            <Card
              sx={{
                cursor: 'grabbing',
                boxShadow: 6,
                transform: 'rotate(3deg)', // Slight rotation for visual feedback
                opacity: 0.95,
                userSelect: 'none',
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: 'primary.main',
                width: 300, // Fixed width for consistent drag preview
                zIndex: 9999,
                pointerEvents: 'none', // Prevent interference with drop detection
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <Avatar
                  src={allRecipes.find(r => r.id === activeId)?.imageUrl ||
                       allRecipes.find(r => r.id === activeId)?.image ||
                       '/images/recipes/default-meal.jpg'}
                  alt={allRecipes.find(r => r.id === activeId)?.name}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  <Restaurant />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {allRecipes.find(r => r.id === activeId)?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(allRecipes.find(r => r.id === activeId)?.prepTime || 0) +
                     (allRecipes.find(r => r.id === activeId)?.cookTime || 0)} min • {allRecipes.find(r => r.id === activeId)?.servings} portions
                  </Typography>
                </Box>
                <Chip
                  label={allRecipes.find(r => r.id === activeId)?.difficulty}
                  size="small"
                  sx={{
                    bgcolor: '#ffffff',
                    color: '#ff9800',
                    fontWeight: 'bold',
                    border: '1px solid #ff9800'
                  }}
                />
              </Box>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Exporter le Planning de Repas
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choisissez le format d'export pour votre planning de repas
          </Typography>

          <List>
            <ListItem
              button
              onClick={() => {
                handleExportText();
                setExportDialogOpen(false);
              }}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 2,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <FileDownload color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Fichier Texte (.txt)"
                secondary="Format simple pour impression ou partage par email"
              />
            </ListItem>

            <ListItem
              button
              onClick={() => {
                handleExportPDF();
                setExportDialogOpen(false);
              }}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <PictureAsPdf color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Format PDF"
                secondary="Ouvre une fenêtre d'impression pour sauvegarder en PDF"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DragDropMealCalendar;
