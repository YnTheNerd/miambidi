/**
 * Blog Context for MiamBidi
 * Manages blog articles, creation, editing, and publishing
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useFamily } from './FirestoreFamilyContext';
import {
  BLOG_COLLECTIONS,
  BLOG_STATUS,
  BLOG_VISIBILITY,
  DEFAULT_BLOG,
  generateSlug,
  sanitizeContent
} from '../types/blog';

const BlogContext = createContext();

export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}

export function BlogProvider({ children }) {
  const { currentUser } = useAuth();
  const { currentFamily } = useFamily();
  
  // State Management
  const [blogs, setBlogs] = useState([]);
  const [publicBlogs, setPublicBlogs] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Create a new blog article
  const createBlog = async (blogData) => {
    if (!currentUser) {
      throw new Error('Vous devez être connecté pour créer un article');
    }

    try {
      setLoading(true);
      setError(null);

      // Generate slug from title
      const slug = generateSlug(blogData.title);
      
      // Sanitize content
      const sanitizedContent = {};
      if (blogData.content) {
        Object.keys(blogData.content).forEach(key => {
          if (typeof blogData.content[key] === 'string') {
            sanitizedContent[key] = sanitizeContent(blogData.content[key]);
          } else {
            sanitizedContent[key] = blogData.content[key];
          }
        });
      }

      const newBlog = {
        ...DEFAULT_BLOG,
        ...blogData,
        slug,
        content: sanitizedContent,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorAvatar: currentUser.photoURL || '',
        familyId: currentFamily?.id || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastEditedBy: currentUser.uid
      };

      const docRef = await addDoc(collection(db, BLOG_COLLECTIONS.blogs), newBlog);
      
      const createdBlog = {
        ...newBlog,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update local state
      setUserBlogs(prev => [createdBlog, ...prev]);
      if (newBlog.status === BLOG_STATUS.PUBLISHED && newBlog.visibility === BLOG_VISIBILITY.PUBLIC) {
        setPublicBlogs(prev => [createdBlog, ...prev]);
      }

      return createdBlog;
    } catch (error) {
      console.error('Error creating blog:', error);
      setError('Erreur lors de la création de l\'article');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing blog article
  const updateBlog = async (blogId, updates) => {
    if (!currentUser) {
      throw new Error('Vous devez être connecté pour modifier un article');
    }

    try {
      setLoading(true);
      setError(null);

      // Sanitize content if provided
      const sanitizedUpdates = { ...updates };
      if (updates.content) {
        const sanitizedContent = {};
        Object.keys(updates.content).forEach(key => {
          if (typeof updates.content[key] === 'string') {
            sanitizedContent[key] = sanitizeContent(updates.content[key]);
          } else {
            sanitizedContent[key] = updates.content[key];
          }
        });
        sanitizedUpdates.content = sanitizedContent;
      }

      // Update slug if title changed
      if (updates.title) {
        sanitizedUpdates.slug = generateSlug(updates.title);
      }

      const updateData = {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
        lastEditedBy: currentUser.uid
      };

      // If publishing for the first time, set publishedAt
      if (updates.status === BLOG_STATUS.PUBLISHED && !updates.publishedAt) {
        updateData.publishedAt = serverTimestamp();
      }

      await updateDoc(doc(db, BLOG_COLLECTIONS.blogs, blogId), updateData);

      // Update local state
      const updateLocalState = (prevBlogs) => 
        prevBlogs.map(blog => 
          blog.id === blogId 
            ? { ...blog, ...sanitizedUpdates, updatedAt: new Date() }
            : blog
        );

      setUserBlogs(updateLocalState);
      setPublicBlogs(updateLocalState);
      setBlogs(updateLocalState);

      return { id: blogId, ...sanitizedUpdates };
    } catch (error) {
      console.error('Error updating blog:', error);
      setError('Erreur lors de la mise à jour de l\'article');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a blog article
  const deleteBlog = async (blogId) => {
    if (!currentUser) {
      throw new Error('Vous devez être connecté pour supprimer un article');
    }

    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, BLOG_COLLECTIONS.blogs, blogId));

      // Update local state
      const removeFromState = (prevBlogs) => prevBlogs.filter(blog => blog.id !== blogId);
      
      setUserBlogs(removeFromState);
      setPublicBlogs(removeFromState);
      setBlogs(removeFromState);

    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Erreur lors de la suppression de l\'article');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch public blogs for landing page with fallback for missing indexes
  const fetchPublicBlogs = useCallback(async (pageSize = 10, startAfterDoc = null) => {
    try {
      setLoading(true);
      setError(null);

      let fetchedBlogs = [];

      try {
        // Primary query with composite index
        let q = query(
          collection(db, BLOG_COLLECTIONS.blogs),
          where('status', '==', BLOG_STATUS.PUBLISHED),
          where('visibility', '==', BLOG_VISIBILITY.PUBLIC),
          orderBy('publishedAt', 'desc'),
          limit(pageSize)
        );

        if (startAfterDoc) {
          q = query(q, startAfter(startAfterDoc));
        }

        const querySnapshot = await getDocs(q);
        fetchedBlogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate()
        }));

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === pageSize);

      } catch (indexError) {
        console.warn('Composite index not available for public blogs, using fallback:', indexError);

        // Fallback query without orderBy
        const fallbackQuery = query(
          collection(db, BLOG_COLLECTIONS.blogs),
          where('status', '==', BLOG_STATUS.PUBLISHED),
          where('visibility', '==', BLOG_VISIBILITY.PUBLIC),
          limit(pageSize)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        fetchedBlogs = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate()
        }));

        // Sort client-side as fallback
        fetchedBlogs.sort((a, b) => {
          const dateA = a.publishedAt || a.createdAt || new Date(0);
          const dateB = b.publishedAt || b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        // Disable pagination for fallback mode
        setHasMore(false);
        setLastVisible(null);
      }

      if (startAfterDoc) {
        setPublicBlogs(prev => [...prev, ...fetchedBlogs]);
      } else {
        setPublicBlogs(fetchedBlogs);
      }

      return fetchedBlogs;
    } catch (error) {
      console.error('Error fetching public blogs:', error);

      // Provide specific error messages
      if (error.code === 'failed-precondition') {
        setError('Base de données en cours de configuration. Contenu limité temporairement.');
      } else if (error.code === 'unavailable') {
        setError('Service temporairement indisponible. Veuillez réessayer.');
      } else {
        setError('Erreur lors du chargement des articles publics.');
      }

      // Return empty array instead of throwing
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's blogs with fallback for missing indexes
  const fetchUserBlogs = useCallback(async () => {
    if (!currentUser) return [];

    try {
      setLoading(true);
      setError(null);

      let fetchedBlogs = [];

      try {
        // Primary query with composite index
        const q = query(
          collection(db, BLOG_COLLECTIONS.blogs),
          where('authorId', '==', currentUser.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        fetchedBlogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate()
        }));

      } catch (indexError) {
        console.warn('Composite index not available, using fallback query:', indexError);

        // Fallback query without orderBy (no index required)
        const fallbackQuery = query(
          collection(db, BLOG_COLLECTIONS.blogs),
          where('authorId', '==', currentUser.uid)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        fetchedBlogs = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate()
        }));

        // Sort client-side as fallback
        fetchedBlogs.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || new Date(0);
          const dateB = b.updatedAt || b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        // Show user-friendly message about database initialization
        setError('Base de données en cours d\'initialisation. Fonctionnalité limitée temporairement.');
      }

      setUserBlogs(fetchedBlogs);
      return fetchedBlogs;
    } catch (error) {
      console.error('Error fetching user blogs:', error);

      // Provide specific error messages based on error type
      if (error.code === 'failed-precondition') {
        setError('Base de données en cours de configuration. Veuillez réessayer dans quelques minutes.');
      } else if (error.code === 'permission-denied') {
        setError('Permissions insuffisantes pour accéder aux articles.');
      } else if (error.code === 'unavailable') {
        setError('Service temporairement indisponible. Veuillez réessayer.');
      } else {
        setError('Erreur lors du chargement de vos articles. Veuillez réessayer.');
      }

      // Return empty array instead of throwing to prevent app crash
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Get a single blog by ID
  const getBlogById = async (blogId) => {
    try {
      const docRef = doc(db, BLOG_COLLECTIONS.blogs, blogId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
          publishedAt: docSnap.data().publishedAt?.toDate()
        };
      } else {
        throw new Error('Article non trouvé');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  };

  // Increment view count
  const incrementViews = useCallback(async (blogId) => {
    try {
      await updateDoc(doc(db, BLOG_COLLECTIONS.blogs, blogId), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }, []);

  // Toggle like on a blog
  const toggleLike = async (blogId) => {
    if (!currentUser) return;

    try {
      const blogRef = doc(db, BLOG_COLLECTIONS.blogs, blogId);
      const blogDoc = await getDoc(blogRef);
      
      if (blogDoc.exists()) {
        const currentLikes = blogDoc.data().likes || [];
        const isLiked = currentLikes.includes(currentUser.uid);
        
        const updatedLikes = isLiked
          ? currentLikes.filter(uid => uid !== currentUser.uid)
          : [...currentLikes, currentUser.uid];

        await updateDoc(blogRef, { likes: updatedLikes });

        // Update local state
        const updateLikes = (prevBlogs) =>
          prevBlogs.map(blog =>
            blog.id === blogId ? { ...blog, likes: updatedLikes } : blog
          );

        setPublicBlogs(updateLikes);
        setUserBlogs(updateLikes);
        setBlogs(updateLikes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Load more public blogs (pagination)
  const loadMorePublicBlogs = async () => {
    if (!hasMore || loading) return;
    
    await fetchPublicBlogs(10, lastVisible);
  };

  const value = {
    // State
    blogs,
    publicBlogs,
    userBlogs,
    loading,
    error,
    hasMore,

    // Actions
    createBlog,
    updateBlog,
    deleteBlog,
    fetchPublicBlogs,
    fetchUserBlogs,
    getBlogById,
    incrementViews,
    toggleLike,
    loadMorePublicBlogs,

    // Utilities
    setError
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );

}