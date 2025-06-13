/**
 * Blog Management Page
 * Main interface for authenticated users to manage their blog articles
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Fab,
  Tab,
  Tabs,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Public,
  Lock,
  Schedule,
  TrendingUp,
  Favorite
} from '@mui/icons-material';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import CreateBlogDialog from '../components/blog/CreateBlogDialog';
import { BLOG_STATUS, BLOG_VISIBILITY, BLOG_TEMPLATES } from '../types/blog';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`blog-tabpanel-${index}`}
      aria-labelledby={`blog-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Blog() {
  const { currentUser } = useAuth();
  const { 
    userBlogs, 
    loading, 
    error, 
    fetchUserBlogs, 
    updateBlog, 
    deleteBlog 
  } = useBlog();

  // UI State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Load user blogs on component mount with retry mechanism
  useEffect(() => {
    if (currentUser) {
      const loadBlogs = async () => {
        try {
          await fetchUserBlogs();
        } catch (error) {
          console.error('Failed to load blogs on mount:', error);
          // Error is already handled in BlogContext
        }
      };

      loadBlogs();
    }
  }, [currentUser, fetchUserBlogs]);

  const handleMenuOpen = (event, blog) => {
    setAnchorEl(event.currentTarget);
    setSelectedBlog(blog);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBlog(null);
  };

  const handleDeleteBlog = async () => {
    if (selectedBlog && window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await deleteBlog(selectedBlog.id);
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === BLOG_STATUS.PUBLISHED 
      ? BLOG_STATUS.DRAFT 
      : BLOG_STATUS.PUBLISHED;
    
    try {
      await updateBlog(blog.id, { status: newStatus });
      handleMenuClose();
    } catch (error) {
      console.error('Error updating blog status:', error);
    }
  };

  const filterBlogsByStatus = (status) => {
    return userBlogs.filter(blog => blog.status === status);
  };

  const renderBlogCard = (blog) => {
    const templateConfig = BLOG_TEMPLATES[blog.template];
    const isPublished = blog.status === BLOG_STATUS.PUBLISHED;

    return (
      <Grid item xs={12} sm={6} md={4} key={blog.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Featured Image */}
          {blog.featuredImage && (
            <Box
              sx={{
                height: 160,
                backgroundImage: `url(${blog.featuredImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          <CardContent sx={{ flexGrow: 1 }}>
            {/* Status and Template */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={isPublished ? 'Publié' : 'Brouillon'}
                color={isPublished ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={templateConfig?.icon + ' ' + templateConfig?.name}
                variant="outlined"
                size="small"
              />
            </Box>

            {/* Title */}
            <Typography variant="h6" component="h2" gutterBottom>
              {blog.title}
            </Typography>

            {/* Excerpt */}
            {blog.excerpt && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {blog.excerpt.length > 100 
                  ? `${blog.excerpt.substring(0, 100)}...` 
                  : blog.excerpt
                }
              </Typography>
            )}

            {/* Metadata */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {blog.visibility === BLOG_VISIBILITY.PUBLIC ? (
                <Public fontSize="small" color="success" />
              ) : (
                <Lock fontSize="small" color="warning" />
              )}
              <Typography variant="caption" color="text.secondary">
                {blog.visibility === BLOG_VISIBILITY.PUBLIC ? 'Public' : 'Premium'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {blog.updatedAt?.toLocaleDateString('fr-FR')}
              </Typography>
            </Box>

            {/* Stats */}
            {isPublished && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" color="action" />
                  <Typography variant="caption">
                    {blog.views || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite fontSize="small" color="action" />
                  <Typography variant="caption">
                    {blog.likes?.length || 0}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {blog.tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
                {blog.tags.length > 3 && (
                  <Chip
                    label={`+${blog.tags.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => {
                // TODO: Implement edit functionality
                console.log('Edit blog:', blog.id);
              }}
            >
              Modifier
            </Button>

            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, blog)}
            >
              <MoreVert />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const handleRetryLoad = async () => {
    try {
      await fetchUserBlogs();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const renderEmptyState = (message) => (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Commencez par créer votre premier article de blog
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setCreateDialogOpen(true)}
      >
        Créer un Article
      </Button>
    </Box>
  );

  const renderErrorState = () => (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2
      }}
    >
      <Alert
        severity="warning"
        sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleRetryLoad}
            disabled={loading}
          >
            Réessayer
          </Button>
        }
      >
        <Typography variant="body1" gutterBottom>
          {error}
        </Typography>
        {error.includes('initialisation') && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            La base de données est en cours de configuration. Cette situation est temporaire et se résoudra automatiquement.
          </Typography>
        )}
      </Alert>

      {!error.includes('initialisation') && (
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ mt: 2 }}
        >
          Créer un Nouvel Article
        </Button>
      )}
    </Box>
  );

  if (loading && userBlogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mes Articles de Blog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Créez et gérez vos articles de blog sur la cuisine camerounaise
        </Typography>
      </Box>

      {error && !loading && (
        renderErrorState()
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={`Tous (${userBlogs.length})`} 
            id="blog-tab-0"
            aria-controls="blog-tabpanel-0"
          />
          <Tab 
            label={`Publiés (${filterBlogsByStatus(BLOG_STATUS.PUBLISHED).length})`}
            id="blog-tab-1"
            aria-controls="blog-tabpanel-1"
          />
          <Tab 
            label={`Brouillons (${filterBlogsByStatus(BLOG_STATUS.DRAFT).length})`}
            id="blog-tab-2"
            aria-controls="blog-tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {!error && (
        <>
          <TabPanel value={tabValue} index={0}>
            {userBlogs.length === 0 ? (
              renderEmptyState('Aucun article créé')
            ) : (
              <Grid container spacing={3}>
                {userBlogs.map(renderBlogCard)}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {filterBlogsByStatus(BLOG_STATUS.PUBLISHED).length === 0 ? (
              renderEmptyState('Aucun article publié')
            ) : (
              <Grid container spacing={3}>
                {filterBlogsByStatus(BLOG_STATUS.PUBLISHED).map(renderBlogCard)}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {filterBlogsByStatus(BLOG_STATUS.DRAFT).length === 0 ? (
              renderEmptyState('Aucun brouillon')
            ) : (
              <Grid container spacing={3}>
                {filterBlogsByStatus(BLOG_STATUS.DRAFT).map(renderBlogCard)}
              </Grid>
            )}
          </TabPanel>
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Créer un article"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          zIndex: 1200
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleToggleStatus(selectedBlog)}>
          {selectedBlog?.status === BLOG_STATUS.PUBLISHED ? 'Mettre en brouillon' : 'Publier'}
        </MenuItem>
        <MenuItem onClick={handleDeleteBlog} sx={{ color: 'error.main' }}>
          Supprimer
        </MenuItem>
      </Menu>

      {/* Create Blog Dialog */}
      <CreateBlogDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
}

export default Blog;
