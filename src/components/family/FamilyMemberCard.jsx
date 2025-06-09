import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  AdminPanelSettings,
  Person,
  Cake,
  LocalDining,
  Warning
} from '@mui/icons-material';

function FamilyMemberCard({ member, currentUser, isAdmin, onEdit, onRemove, onRoleChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit();
    handleMenuClose();
  };

  const handleRemove = () => {
    onRemove();
    handleMenuClose();
  };

  const handleRoleToggle = () => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    onRoleChange(newRole);
    handleMenuClose();
  };

  const isCurrentUser = member.uid === currentUser?.uid;
  const canEdit = isAdmin || isCurrentUser;
  const canRemove = isAdmin && !isCurrentUser;
  const canChangeRole = isAdmin && !isCurrentUser;

  const getDietaryInfo = () => {
    const restrictions = member.preferences?.dietaryRestrictions || [];
    const allergies = member.preferences?.allergies || [];
    return [...restrictions, ...allergies];
  };

  const getAvatarColor = (role) => {
    return role === 'admin' ? 'primary.main' : 'secondary.main';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header with Avatar and Menu */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: getAvatarColor(member.role),
                width: 56, 
                height: 56,
                mr: 2,
                fontSize: '1.5rem'
              }}
            >
              {member.displayName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" noWrap>
                {member.displayName}
                {isCurrentUser && (
                  <Chip 
                    label="You" 
                    size="small" 
                    sx={{ ml: 1 }} 
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {member.email}
              </Typography>
            </Box>
          </Box>
          
          {(canEdit || canRemove || canChangeRole) && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Role Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={member.role === 'admin' ? <AdminPanelSettings /> : <Person />}
            label={member.role === 'admin' ? 'Admin' : 'Member'}
            color={member.role === 'admin' ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        {/* Member Details */}
        <Box sx={{ mb: 2 }}>
          {member.age && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Cake sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {member.age} years old
              </Typography>
            </Box>
          )}
        </Box>

        {/* Dietary Information */}
        {getDietaryInfo().length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning sx={{ fontSize: 16, mr: 1, color: 'warning.main' }} />
              <Typography variant="body2" fontWeight="medium">
                Dietary Notes:
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {getDietaryInfo().map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Favorite Categories */}
        {member.preferences?.favoriteCategories?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalDining sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
              <Typography variant="body2" fontWeight="medium">
                Favorite Cuisines:
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {member.preferences.favoriteCategories.map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  size="small"
                  variant="outlined"
                  color="success"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Profile</ListItemText>
          </MenuItem>
        )}
        
        {canChangeRole && (
          <MenuItem onClick={handleRoleToggle}>
            <ListItemIcon>
              {member.role === 'admin' ? <Person fontSize="small" /> : <AdminPanelSettings fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              Make {member.role === 'admin' ? 'Member' : 'Admin'}
            </ListItemText>
          </MenuItem>
        )}
        
        {(canEdit || canChangeRole) && canRemove && <Divider />}
        
        {canRemove && (
          <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Remove from Family</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

export default FamilyMemberCard;
