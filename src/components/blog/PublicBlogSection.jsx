/**
 * Public Blog Section Component
 * Displays published blog articles on the landing page for all visitors
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  Divider,
  IconButton
} from '@mui/material';
import {
  Schedule,
  Visibility,
  Favorite,
  FavoriteBorder,
  ArrowForward,
  TrendingUp,
  Public,
  Lock
} from '@mui/icons-material';
import { useBlog } from '../../contexts/BlogContext';
import { useAuth } from '../../contexts/AuthContext';
import { BLOG_VISIBILITY, BLOG_TEMPLATES } from '../../types/blog';

function PublicBlogSection({ maxArticles = 6, showHeader = true }) {
  const { currentUser } = useAuth();
  const {
    publicBlogs,
    loading,
    error,
    fetchPublicBlogs,
    toggleLike,
    incrementViews,
    loadMorePublicBlogs,
    hasMore
  } = useBlog();

  const [expandedBlog, setExpandedBlog] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize maxArticles to prevent unnecessary re-renders
  const memoizedMaxArticles = useMemo(() => maxArticles, [maxArticles]);

  // Stable fetch function to prevent infinite loops
  const stableFetchBlogs = useCallback(async () => {
    if (!isInitialized) {
      try {
        await fetchPublicBlogs(memoizedMaxArticles);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        // Error is handled by BlogContext
      }
    }
  }, [fetchPublicBlogs, memoizedMaxArticles, isInitialized]);

  useEffect(() => {
    stableFetchBlogs();
  }, [stableFetchBlogs]);

  const handleReadMore = useCallback(async (blog) => {
    try {
      // Increment view count
      await incrementViews(blog.id);
      setExpandedBlog(blog);
    } catch (error) {
      console.error('Error handling read more:', error);
      // Don't crash the app for view count errors
    }
  }, [incrementViews]);

  const handleLike = useCallback(async (blogId, event) => {
    event.stopPropagation();
    if (currentUser) {
      try {
        await toggleLike(blogId);
      } catch (error) {
        console.error('Error handling like:', error);
        // Don't crash the app for like errors
      }
    }
  }, [currentUser, toggleLike]);

  const renderBlogCard = (blog, featured = false) => {
    const templateConfig = BLOG_TEMPLATES[blog.template];
    const isLiked = currentUser && blog.likes?.includes(currentUser.uid);

    return (
      <Grid item xs={12} sm={featured ? 12 : 6} md={featured ? 8 : 4} key={blog.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: featured ? 'row' : 'column',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => handleReadMore(blog)}
        >
          {/* Featured Image */}
          {blog.featuredImage && (
            <CardMedia
              component="div"
              sx={{
                height: featured ? 'auto' : 200,
                width: featured ? 300 : 'auto',
                minHeight: featured ? 200 : 'auto',
                backgroundImage: `url(${blog.featuredImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          <CardContent sx={{ flexGrow: 1, p: featured ? 3 : 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                {/* Template and Visibility */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label={templateConfig?.icon + ' ' + templateConfig?.name}
                    size="small"
                    variant="outlined"
                  />
                  {blog.visibility === BLOG_VISIBILITY.PREMIUM && (
                    <Chip
                      icon={<Lock />}
                      label="Premium"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Title */}
                <Typography 
                  variant={featured ? "h5" : "h6"} 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: featured ? 2 : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {blog.title}
                </Typography>
              </Box>

              {/* Like Button */}
              <IconButton
                size="small"
                onClick={(e) => handleLike(blog.id, e)}
                disabled={!currentUser}
                sx={{ ml: 1 }}
              >
                {isLiked ? (
                  <Favorite color="error" fontSize="small" />
                ) : (
                  <FavoriteBorder fontSize="small" />
                )}
              </IconButton>
            </Box>

            {/* Excerpt */}
            {blog.excerpt && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: featured ? 3 : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.6
                }}
              >
                {blog.excerpt}
              </Typography>
            )}

            {/* Author and Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar 
                src={blog.authorAvatar} 
                sx={{ width: 24, height: 24 }}
              >
                {blog.authorName?.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {blog.authorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Schedule fontSize="small" color="action" sx={{ fontSize: 14 }} />
              <Typography variant="caption" color="text.secondary">
                {blog.publishedAt?.toLocaleDateString('fr-FR')}
              </Typography>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {blog.views || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {blog.likes?.length || 0}
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadMore(blog);
                }}
              >
                Lire plus
              </Button>
            </Box>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {blog.tags.slice(0, featured ? 5 : 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                ))}
                {blog.tags.length > (featured ? 5 : 3) && (
                  <Chip
                    label={`+${blog.tags.length - (featured ? 5 : 3)}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading && publicBlogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert
          severity={error.includes('initialisation') ? 'info' : 'warning'}
          sx={{ my: 4 }}
        >
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          {error.includes('initialisation') && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              La plateforme blog est en cours de configuration. Revenez dans quelques minutes pour découvrir nos articles sur la cuisine camerounaise !
            </Typography>
          )}
        </Alert>
      </Container>
    );
  }

  if (publicBlogs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucun article publié pour le moment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revenez bientôt pour découvrir nos articles sur la cuisine camerounaise !
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {showHeader && (
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Blog Culinaire MiamBidi
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Découvrez les secrets de la cuisine camerounaise
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Articles authentiques, recettes traditionnelles et conseils culinaires 
            partagés par notre communauté passionnée de cuisine africaine.
          </Typography>
        </Box>
      )}

      {/* Featured Article */}
      {publicBlogs.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" />
            Article en vedette
          </Typography>
          <Grid container spacing={3}>
            {renderBlogCard(publicBlogs[0], true)}
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Recent Articles */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Articles récents
        </Typography>
        <Grid container spacing={3}>
          {publicBlogs.slice(1).map(blog => renderBlogCard(blog))}
        </Grid>
      </Box>

      {/* Load More Button */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={loadMorePublicBlogs}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Charger plus d\'articles'}
          </Button>
        </Box>
      )}


    </Container>
  );
}

export default PublicBlogSection;
