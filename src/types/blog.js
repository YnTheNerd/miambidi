/**
 * Blog System Schema for MiamBidi
 * Comprehensive blog data structure with template support
 */

// Blog Article Schema for Firebase Collection
export const BlogSchema = {
  id: 'string', // Auto-generated Firestore document ID
  title: 'string', // Required - Blog article title (5-100 characters)
  slug: 'string', // URL-friendly version of title
  
  // Template and Content Structure
  template: 'string', // 'template-a', 'template-b', 'template-c'
  content: 'object', // Template-specific content structure
  
  // Publication Settings
  status: 'string', // 'draft', 'published', 'archived'
  visibility: 'string', // 'public', 'premium' (registered users only)
  publishedAt: 'timestamp', // When article was published
  
  // Author Information
  authorId: 'string', // User ID of the author
  authorName: 'string', // Display name of the author
  authorAvatar: 'string', // Author's profile image
  
  // Family Integration
  familyId: 'string|null', // Family ownership (null for personal blogs)
  
  // SEO and Discovery
  excerpt: 'string', // Short description for previews (max 200 chars)
  tags: 'array', // Array of tags for categorization
  featuredImage: 'string', // Main image for the article
  
  // Recipe Integration
  relatedRecipes: 'array', // Array of recipe IDs referenced in the blog
  
  // Engagement Metrics
  views: 'number', // View count
  likes: 'array', // Array of user IDs who liked the article
  comments: 'array', // Array of comment objects (future feature)
  
  // Metadata
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  lastEditedBy: 'string', // User ID of last editor
  
  // Content Moderation
  isModerated: 'boolean', // Whether content has been reviewed
  moderationFlags: 'array', // Any moderation issues
};

// Template A: Hero Image + Main Text
export const TemplateASchema = {
  heroImage: {
    url: 'string',
    alt: 'string',
    caption: 'string'
  },
  mainText: 'string' // Rich text content
};

// Template B: Alternating Images and Text
export const TemplateBSchema = {
  sections: [
    {
      type: 'image',
      image: {
        url: 'string',
        alt: 'string',
        caption: 'string'
      }
    },
    {
      type: 'text',
      content: 'string' // Rich text content
    }
    // Alternating pattern continues
  ]
};

// Template C: Gallery with Descriptive Text
export const TemplateCSchema = {
  gallery: [
    {
      url: 'string',
      alt: 'string',
      caption: 'string'
    }
  ],
  description: 'string' // Rich text content describing the gallery
};

// Blog Comment Schema (Future Feature)
export const BlogCommentSchema = {
  id: 'string',
  blogId: 'string',
  authorId: 'string',
  authorName: 'string',
  content: 'string',
  parentId: 'string|null', // For nested comments
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  isModerated: 'boolean'
};

// Blog Categories
export const BLOG_CATEGORIES = [
  'Recettes Traditionnelles',
  'Conseils Culinaires',
  'Culture Camerounaise',
  'Nutrition & Santé',
  'Techniques de Cuisine',
  'Ingrédients Locaux',
  'Fêtes & Célébrations',
  'Cuisine Familiale',
  'Astuces de Chef',
  'Histoire Culinaire'
];

// Blog Tags
export const BLOG_TAGS = [
  'camerounais',
  'traditionnel',
  'facile',
  'rapide',
  'végétarien',
  'épicé',
  'festif',
  'économique',
  'nutritif',
  'authentique',
  'moderne',
  'fusion',
  'street-food',
  'dessert',
  'boisson',
  'technique',
  'astuce',
  'histoire',
  'culture',
  'famille'
];

// Template Definitions
export const BLOG_TEMPLATES = {
  'template-a': {
    id: 'template-a',
    name: 'Image Héros + Texte',
    description: '1 grande image en en-tête avec un bloc de texte principal',
    icon: '🖼️',
    preview: '/images/blog-templates/template-a-preview.jpg',
    maxImages: 1,
    maxTextBlocks: 1
  },
  'template-b': {
    id: 'template-b',
    name: 'Alternance Images/Texte',
    description: '2 images et 2 blocs de texte en alternance',
    icon: '📖',
    preview: '/images/blog-templates/template-b-preview.jpg',
    maxImages: 2,
    maxTextBlocks: 2
  },
  'template-c': {
    id: 'template-c',
    name: 'Galerie + Description',
    description: '2 images en galerie avec un texte descriptif',
    icon: '🎨',
    preview: '/images/blog-templates/template-c-preview.jpg',
    maxImages: 2,
    maxTextBlocks: 1
  }
};

// Blog Status Options
export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Blog Visibility Options
export const BLOG_VISIBILITY = {
  PUBLIC: 'public',
  PREMIUM: 'premium'
};

// Firebase Collections
export const BLOG_COLLECTIONS = {
  blogs: 'blogs',
  comments: 'blog-comments',
  analytics: 'blog-analytics'
};

// Default Blog Article
export const DEFAULT_BLOG = {
  title: '',
  slug: '',
  template: 'template-a',
  content: {},
  status: BLOG_STATUS.DRAFT,
  visibility: BLOG_VISIBILITY.PUBLIC,
  excerpt: '',
  tags: [],
  featuredImage: '',
  relatedRecipes: [],
  views: 0,
  likes: [],
  comments: [],
  isModerated: false,
  moderationFlags: []
};

// Content Validation Rules
export const BLOG_VALIDATION = {
  title: {
    minLength: 5,
    maxLength: 100,
    required: true
  },
  excerpt: {
    maxLength: 200,
    required: false
  },
  content: {
    minLength: 50,
    required: true
  },
  tags: {
    maxCount: 10,
    required: false
  },
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    required: true
  }
};

// SEO and URL Generation
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

// Content Sanitization
export const sanitizeContent = (content) => {
  // Basic HTML sanitization for rich text content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export default {
  BlogSchema,
  TemplateASchema,
  TemplateBSchema,
  TemplateCSchema,
  BlogCommentSchema,
  BLOG_CATEGORIES,
  BLOG_TAGS,
  BLOG_TEMPLATES,
  BLOG_STATUS,
  BLOG_VISIBILITY,
  BLOG_COLLECTIONS,
  DEFAULT_BLOG,
  BLOG_VALIDATION,
  generateSlug,
  sanitizeContent
};
