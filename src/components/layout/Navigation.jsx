import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  CalendarMonth,
  MenuBook,
  Restaurant,
  Kitchen,
  ShoppingCart,
  Group,
  Dashboard,
  Article,
  Store
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFamily } from '../../contexts/FirestoreFamilyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSeller } from '../../contexts/SellerContext';
import GlobalNotifications from './GlobalNotifications';
import SellerRegistration from '../seller/SellerRegistration';

function Navigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sellerRegistrationOpen, setSellerRegistrationOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { family } = useFamily();
  const { isSeller } = useSeller();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Tableau de Bord', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Calendrier Repas', icon: <CalendarMonth />, path: '/calendar' },
    { text: 'Recettes', icon: <MenuBook />, path: '/recipes' },
    { text: 'Blog', icon: <Article />, path: '/blog' },
    { text: 'Ingrédients', icon: <Restaurant />, path: '/ingredients' },
    { text: 'Garde-Manger', icon: <Kitchen />, path: '/garde-manger' },
    { text: 'Liste de Courses', icon: <ShoppingCart />, path: '/liste-courses' },
    { text: 'Famille', icon: <Group />, path: '/family' },
    ...(isSeller ? [{ text: 'Tableau Vendeur', icon: <Store />, path: '/seller-dashboard' }] : [])
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      console.log('🔐 Logging out user...');
      handleMenuClose();

      // Clear any local storage data
      localStorage.removeItem('recipe-favorites');
      localStorage.removeItem('meal-plan-cache');
      localStorage.removeItem('shopping-list-cache');

      // Clear session storage
      sessionStorage.clear();

      // Call Firebase logout
      await logout();

      console.log('✅ Logout successful');

      // Navigate to landing page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, navigate to landing page
      navigate('/', { replace: true });
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap>
         𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢
        </Typography>
        {family && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {family.name}
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            𝐌𝐢𝐚𝐦𝐁𝐢𝐝𝐢
            {family && !isMobile && (
              <Typography variant="body2" component="span" sx={{ ml: 2, opacity: 0.8 }}>
                {family.name}
              </Typography>
            )}
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Global Notifications */}
          <GlobalNotifications />

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            {currentUser?.photoURL ? (
              <Avatar src={currentUser.photoURL} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      )}

      {/* Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Profile & Settings
        </MenuItem>

        {!isSeller && (
          <MenuItem onClick={() => { setSellerRegistrationOpen(true); handleMenuClose(); }}>
            <ListItemIcon>
              <Store fontSize="small" />
            </ListItemIcon>
            Devenir vendeur
          </MenuItem>
        )}

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Seller Registration Dialog */}
      <SellerRegistration
        open={sellerRegistrationOpen}
        onClose={() => setSellerRegistrationOpen(false)}
        onSuccess={() => {
          setSellerRegistrationOpen(false);
          navigate('/seller-dashboard');
        }}
      />
    </>
  );
}

export default Navigation;
