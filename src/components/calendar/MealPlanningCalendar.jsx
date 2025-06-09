import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tooltip,
  Drawer,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  Divider
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Warning,
  Search,
  Restaurant,
  Delete,
  CalendarMonth
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useRecipes } from '../../contexts/RecipeContext';
import { useMockFamily } from '../../contexts/MockFamilyContext';

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
        '&:active': { cursor: 'grabbing' }
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
        height: { xs: '90px', sm: '100px' },
        minHeight: { xs: '90px', sm: '100px' },
        maxHeight: { xs: '90px', sm: '100px' },
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
          {/* Header with avatar, conflicts, and delete */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5
          }}>
            <Avatar
              src={plannedMeal.recipe.imageUrl || plannedMeal.recipe.image || '/images/recipes/default-meal.jpg'}
              alt={plannedMeal.recipe.name}
              sx={{ width: 20, height: 20 }}
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

          {/* Recipe name */}
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
              justifyContent: 'center'
            }}
          >
            {plannedMeal.recipe.name}
          </Typography>

          {/* Recipe details */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontSize: '0.7rem'
            }}
          >
            {plannedMeal.recipe.prepTime + plannedMeal.recipe.cookTime} min
          </Typography>
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
            Ajouter un repas
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function MealPlanningCalendar() {
  const { getAllRecipes, planMealForDate, getMealPlan, updateMealStatus } = useRecipes();
  const { familyMembers } = useMockFamily();

  // Debug log to confirm component is rendering
  console.log('MealPlanningCalendar rendering with', getAllRecipes().length, 'recipes');

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
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
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
  };

  // Check for family conflicts
  const checkFamilyConflicts = (recipe) => {
    const conflicts = [];

    familyMembers.forEach(member => {
      // Check allergies
      if (member.allergies) {
        const memberAllergies = member.allergies.map(a => a.toLowerCase());
        const recipeAllergens = recipe.dietaryInfo?.allergens?.map(a => a.toLowerCase()) || [];

        const hasAllergy = memberAllergies.some(allergy =>
          recipeAllergens.includes(allergy) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(allergy))
        );

        if (hasAllergy) {
          conflicts.push(`${member.displayName} (allergie)`);
        }
      }

      // Check dietary restrictions
      if (member.dietaryRestrictions) {
        const memberRestrictions = member.dietaryRestrictions.map(r => r.toLowerCase());

        const violatesRestriction = memberRestrictions.some(restriction => {
          if (restriction.includes('végétarien') && !recipe.dietaryInfo?.isVegetarian) return true;
          if (restriction.includes('végan') && !recipe.dietaryInfo?.isVegan) return true;
          if (restriction.includes('sans gluten') && !recipe.dietaryInfo?.isGlutenFree) return true;
          if (restriction.includes('sans produits laitiers') && !recipe.dietaryInfo?.isDairyFree) return true;
          return false;
        });

        if (violatesRestriction) {
          conflicts.push(`${member.displayName} (restriction)`);
        }
      }
    });

    return conflicts;
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // Check if dropping on a meal slot
    if (over.data.current?.type === 'meal-slot') {
      const recipe = allRecipes.find(r => r.id === active.id);
      const { day, mealType } = over.data.current;

      if (recipe) {
        const dateKey = weekDates[FRENCH_DAYS.indexOf(day)].toISOString().split('T')[0];
        const mealKey = `${dateKey}-${mealType}`;

        // Plan the meal
        const plannedMeal = planMealForDate(dateKey, recipe.id, mealType);

        setMealPlan(prev => ({
          ...prev,
          [mealKey]: {
            ...plannedMeal,
            recipe: recipe
          }
        }));
      }
    }

    setActiveId(null);
  };

  const handleRemoveMeal = (day, mealType) => {
    const dateKey = weekDates[FRENCH_DAYS.indexOf(day)].toISOString().split('T')[0];
    const mealKey = `${dateKey}-${mealType}`;

    setMealPlan(prev => {
      const newPlan = { ...prev };
      delete newPlan[mealKey];
      return newPlan;
    });
  };

  // Format date range for display
  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 64px)', // Subtract toolbar height
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Recipe Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: { xs: 280, sm: 320 },
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: { xs: 280, sm: 320 },
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recettes Disponibles
            </Typography>

            <TextField
              fullWidth
              placeholder="Rechercher des recettes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ height: 'calc(100vh - 264px)', overflowY: 'auto' }}>
              <SortableContext items={filteredRecipes.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {filteredRecipes.map((recipe) => (
                  <DraggableRecipe key={recipe.id} recipe={recipe} />
                ))}
              </SortableContext>
            </Box>
          </Box>
        </Drawer>

        {/* Main Calendar Area */}
        <Box sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          overflow: 'auto',
          height: '100%'
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 3 },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              order: { xs: 1, md: 1 }
            }}>
              <CalendarMonth color="primary" sx={{ fontSize: { xs: 24, sm: 32 } }} />
              <Typography variant={{ xs: 'h5', sm: 'h4' }} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Planification des Repas
              </Typography>
              <Typography variant="h6" sx={{ display: { xs: 'block', sm: 'none' } }}>
                Planning
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              order: { xs: 3, md: 2 },
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <IconButton onClick={goToPreviousWeek} size={{ xs: 'small', sm: 'medium' }}>
                <ChevronLeft />
              </IconButton>
              <Typography
                variant={{ xs: 'body1', sm: 'h6' }}
                sx={{
                  minWidth: { xs: 150, sm: 200 },
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', sm: '1.25rem' }
                }}
              >
                {formatDateRange()}
              </Typography>
              <IconButton onClick={goToNextWeek} size={{ xs: 'small', sm: 'medium' }}>
                <ChevronRight />
              </IconButton>
            </Box>

            <Button
              variant="outlined"
              onClick={() => setDrawerOpen(!drawerOpen)}
              size={{ xs: 'small', sm: 'medium' }}
              sx={{
                order: { xs: 2, md: 3 },
                minWidth: { xs: 'auto', sm: 'auto' }
              }}
            >
              {drawerOpen ? 'Masquer' : 'Afficher'} Recettes
            </Button>
          </Box>

          {/* Calendar Grid */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {FRENCH_DAYS.map((day, dayIndex) => {
              const currentDate = weekDates[dayIndex];

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={12/7}
                  lg={12/7}
                  xl={12/7}
                  key={day}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: {
                      xs: '400px',
                      sm: '450px',
                      md: '500px'
                    },
                    maxHeight: {
                      xs: '500px',
                      sm: '550px',
                      md: '600px'
                    }
                  }}
                >
                  {/* Day Header */}
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 2,
                      mb: 1,
                      minHeight: { xs: '70px', sm: '80px' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography
                      variant={{ xs: 'subtitle1', sm: 'h6' }}
                      fontWeight="bold"
                      sx={{
                        lineHeight: 1.2,
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {day}
                    </Typography>
                    <Typography
                      variant={{ xs: 'caption', sm: 'body2' }}
                      sx={{
                        mt: { xs: 0.5, sm: 1 },
                        opacity: 0.9,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {currentDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Typography>
                  </Paper>

                  {/* Meal Slots Container */}
                  <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, sm: 1.5 }
                  }}>
                    {MEAL_TYPES.map((mealType, mealIndex) => {
                      const dateKey = currentDate.toISOString().split('T')[0];
                      const mealKey = `${dateKey}-${mealType}`;
                      const plannedMeal = mealPlan[mealKey];
                      const conflicts = plannedMeal ? checkFamilyConflicts(plannedMeal.recipe) : [];

                      return (
                        <Box
                          key={mealType}
                          sx={{
                            flex: 1,
                            minHeight: { xs: '100px', sm: '120px' },
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Meal Type Label */}
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{
                              display: 'block',
                              mb: { xs: 0.5, sm: 1 },
                              color: 'text.secondary',
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontSize: { xs: '0.65rem', sm: '0.75rem' }
                            }}
                          >
                            {mealType}
                          </Typography>

                          {/* Meal Slot */}
                          <Box sx={{ flex: 1 }}>
                            <MealSlot
                              day={day}
                              mealType={mealType}
                              plannedMeal={plannedMeal}
                              onRemoveMeal={handleRemoveMeal}
                              familyConflicts={conflicts}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <DraggableRecipe recipe={allRecipes.find(r => r.id === activeId)} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}

export default MealPlanningCalendar;
