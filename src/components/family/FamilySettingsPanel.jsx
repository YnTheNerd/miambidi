import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  Divider,
  Alert,
  Autocomplete
} from '@mui/material';
import { Save, Settings } from '@mui/icons-material';

const MEAL_TIME_OPTIONS = [
  'breakfast', 'brunch', 'lunch', 'snack', 'dinner', 'dessert', 'late-night'
];

const SHOPPING_CATEGORIES = [
  'Produce', 'Dairy', 'Meat & Seafood', 'Pantry', 'Frozen',
  'Beverages', 'Snacks', 'Condiments', 'Bakery', 'Deli', 'Other'
];

function FamilySettingsPanel({ family, isAdmin, onUpdateSettings, onAlert }) {
  const [settings, setSettings] = useState({
    allowMemberInvites: true,
    weekStartsOn: 'monday',
    defaultMealTimes: ['breakfast', 'lunch', 'dinner'],
    shoppingListCategories: []
  });

  const [familyName, setFamilyName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize settings when family data loads
  useEffect(() => {
    if (family) {
      setSettings(family.settings || {
        allowMemberInvites: true,
        weekStartsOn: 'monday',
        defaultMealTimes: ['breakfast', 'lunch', 'dinner'],
        shoppingListCategories: SHOPPING_CATEGORIES
      });
      setFamilyName(family.name || '');
    }
  }, [family]);

  const handleSettingChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (field) => (event, newValue) => {
    setSettings(prev => ({
      ...prev,
      [field]: newValue
    }));
    setHasChanges(true);
  };

  const handleFamilyNameChange = (event) => {
    setFamilyName(event.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      onUpdateSettings(settings);
      setHasChanges(false);
      onAlert({ type: 'success', message: 'Family settings updated successfully!' });
    } catch (error) {
      onAlert({ type: 'error', message: 'Failed to update family settings.' });
    }
  };

  const handleReset = () => {
    if (family) {
      setSettings(family.settings);
      setFamilyName(family.name);
      setHasChanges(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Settings sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Admin Access Required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Only family administrators can modify family settings.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Family Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Family Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Family ID"
                    value={family?.id || ''}
                    disabled
                    helperText="Share this ID to invite new members"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Family name can be edited from the main Family Management page header
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Week Starts On</InputLabel>
                    <Select
                      value={settings.weekStartsOn}
                      onChange={handleSettingChange('weekStartsOn')}
                      label="Week Starts On"
                    >
                      <MenuItem value="sunday">Sunday</MenuItem>
                      <MenuItem value="monday">Monday</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowMemberInvites}
                        onChange={handleSettingChange('allowMemberInvites')}
                      />
                    }
                    label="Allow members to invite others"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Meal Planning Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meal Planning Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure default meal times that appear in your weekly calendar
              </Typography>
              <Autocomplete
                multiple
                options={MEAL_TIME_OPTIONS}
                value={settings.defaultMealTimes}
                onChange={handleArrayChange('defaultMealTimes')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="primary"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Default Meal Times"
                    placeholder="Select meal times..."
                  />
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Shopping List Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shopping List Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Customize categories for organizing your shopping lists
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={SHOPPING_CATEGORIES}
                value={settings.shoppingListCategories}
                onChange={handleArrayChange('shoppingListCategories')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="secondary"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Shopping Categories"
                    placeholder="Add or select categories..."
                    helperText="Type and press Enter to add custom categories"
                  />
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={!hasChanges}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={!hasChanges}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FamilySettingsPanel;
