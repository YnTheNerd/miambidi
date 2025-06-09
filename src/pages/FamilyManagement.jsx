import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Alert
} from '@mui/material';
import {
  Group,
  PersonAdd,
  Settings,
  Edit,
  Delete,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import { useFamily } from '../contexts/FirestoreFamilyContext';
import FamilyMemberCard from '../components/family/FamilyMemberCard';
import AddMemberDialog from '../components/family/AddMemberDialog';
import EditMemberDialog from '../components/family/EditMemberDialog';
import FamilySettingsPanel from '../components/family/FamilySettingsPanel';
import FamilyNameEditor from '../components/family/FamilyNameEditor';
import FamilySetup from '../components/family/FamilySetup';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`family-tabpanel-${index}`}
      aria-labelledby={`family-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function FamilyManagement() {
  const {
    currentUser,
    family,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateMemberRole,
    updateFamilySettings,
    updateFamilyName,
    loading
  } = useFamily();

  const [tabValue, setTabValue] = useState(0);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddMember = (memberData) => {
    try {
      addFamilyMember(memberData);
      setAddMemberOpen(false);
      setAlert({ type: 'success', message: 'Family member added successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to add family member.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEditMember = (memberData) => {
    try {
      updateFamilyMember(selectedMember.uid, memberData);
      setEditMemberOpen(false);
      setSelectedMember(null);
      setAlert({ type: 'success', message: 'Family member updated successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update family member.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      try {
        removeFamilyMember(memberId);
        setAlert({ type: 'success', message: 'Family member removed successfully!' });
        setTimeout(() => setAlert(null), 3000);
      } catch (error) {
        setAlert({ type: 'error', message: error.message });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    try {
      updateMemberRole(memberId, newRole);
      setAlert({ type: 'success', message: 'Member role updated successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const openEditDialog = (member) => {
    setSelectedMember(member);
    setEditMemberOpen(true);
  };

  const isAdmin = currentUser?.role === 'admin';

  // Show family setup if no family is configured
  if (!loading && !family) {
    return <FamilySetup />;
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Chargement de la famille...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <FamilyNameEditor
          familyName={family?.name || 'Loading...'}
          isAdmin={isAdmin}
          onUpdateName={updateFamilyName}
          onAlert={setAlert}
        />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage your family members, roles, and settings
        </Typography>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Family Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Group sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5">{family?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {familyMembers.length} members • Family ID: {family?.id}
                </Typography>
              </Box>
            </Box>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setAddMemberOpen(true)}
              >
                Add Member
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Family Members" />
          <Tab label="Family Settings" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {familyMembers.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.uid}>
              <FamilyMemberCard
                member={member}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onEdit={() => openEditDialog(member)}
                onRemove={() => handleRemoveMember(member.uid)}
                onRoleChange={(newRole) => handleRoleChange(member.uid, newRole)}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <FamilySettingsPanel
          family={family}
          isAdmin={isAdmin}
          onUpdateSettings={updateFamilySettings}
          onAlert={setAlert}
        />
      </TabPanel>

      {/* Dialogs */}
      <AddMemberDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onAdd={handleAddMember}
      />

      <EditMemberDialog
        open={editMemberOpen}
        member={selectedMember}
        onClose={() => {
          setEditMemberOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleEditMember}
      />
    </Box>
  );
}

export default FamilyManagement;
