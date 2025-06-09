/**
 * Global Notifications Component for MiamBidi
 * Displays notification bell and refresh button on all pages
 */

import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  Notifications,
  Refresh,
  Warning,
  Error,
  CheckCircle,
  Kitchen,
  Schedule
} from '@mui/icons-material';
import { usePantry } from '../../contexts/PantryContext';
import { useNotification } from '../../contexts/NotificationContext';

function GlobalNotifications() {
  const { expiringItems, expiredItems, loading } = usePantry();
  const { showNotification } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);

  // Calculate total notification count
  const notificationCount = expiringItems.length + expiredItems.length;

  // Handle notification bell click
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle notification menu close
  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
    showNotification('Page actualisée', 'info');
  };

  // Format expiration message
  const formatExpirationMessage = (item) => {
    if (item.isExpired) {
      const daysExpired = Math.abs(item.daysUntilExpiry || 0);
      return `Expiré depuis ${daysExpired} jour(s)`;
    }
    return `Expire dans ${item.daysUntilExpiry} jour(s)`;
  };

  // Get notification color
  const getNotificationColor = () => {
    if (expiredItems.length > 0) return 'error';
    if (expiringItems.length > 0) return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Notification Bell */}
      <Tooltip 
        title={
          notificationCount > 0 
            ? `${notificationCount} notification(s) du garde-manger`
            : 'Aucune notification'
        }
      >
        <IconButton
          color={getNotificationColor()}
          onClick={handleNotificationClick}
          sx={{
            '&:hover': {
              backgroundColor: notificationCount > 0 ? 'rgba(255, 152, 0, 0.1)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Badge 
            badgeContent={notificationCount} 
            color={getNotificationColor()}
            max={99}
          >
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Refresh Button */}
      <Tooltip title="Actualiser la page">
        <IconButton
          onClick={handleRefresh}
          disabled={loading}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Refresh />
        </IconButton>
      </Tooltip>

      {/* Notification Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Menu Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Kitchen color="primary" />
            Notifications Garde-Manger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {notificationCount > 0 
              ? `${notificationCount} ingrédient(s) nécessitent votre attention`
              : 'Tout va bien dans votre garde-manger !'
            }
          </Typography>
        </Box>

        {/* No Notifications */}
        {notificationCount === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Aucune notification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tous vos ingrédients sont en bon état
            </Typography>
          </Box>
        )}

        {/* Expired Items */}
        {expiredItems.length > 0 && (
          <>
            <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Error />
                Ingrédients Expirés ({expiredItems.length})
              </Typography>
            </Box>
            <List dense>
              {expiredItems.slice(0, 5).map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.ingredientName}
                    secondary={formatExpirationMessage(item)}
                  />
                </ListItem>
              ))}
              {expiredItems.length > 5 && (
                <ListItem>
                  <ListItemText
                    primary={`... et ${expiredItems.length - 5} autre(s)`}
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
            <Divider />
          </>
        )}

        {/* Expiring Items */}
        {expiringItems.length > 0 && (
          <>
            <Box sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning />
                Bientôt Expirés ({expiringItems.length})
              </Typography>
            </Box>
            <List dense>
              {expiringItems.slice(0, 5).map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.ingredientName}
                    secondary={formatExpirationMessage(item)}
                  />
                </ListItem>
              ))}
              {expiringItems.length > 5 && (
                <ListItem>
                  <ListItemText
                    primary={`... et ${expiringItems.length - 5} autre(s)`}
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}

        {/* Action Buttons */}
        {notificationCount > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  window.location.href = '/garde-manger';
                  handleNotificationClose();
                }}
                startIcon={<Kitchen />}
              >
                Voir Garde-Manger
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleNotificationClose}
              >
                Fermer
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default GlobalNotifications;
