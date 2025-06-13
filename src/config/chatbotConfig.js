/**
 * Chatbot Configuration for MiamBidi
 * Centralized configuration for chatbot behavior and responses
 */

export const CHATBOT_CONFIG = {
  // Personality settings
  personality: {
    name: 'Assistant Culinaire MiamBidi',
    language: 'fr',
    tone: 'friendly',
    expertise: 'camerounaise_cuisine',
    fallbackHumor: true
  },

  // Response patterns
  responses: {
    welcome: `Salut ! 👋 Je suis votre Assistant Culinaire MiamBidi ! 🍽️

Je peux vous aider avec :
• Recommandations de recettes 👨‍🍳
• Gestion du garde-manger 📦
• Conseils de cuisine camerounaise 🇨🇲
• Navigation dans l'application 📱

Que puis-je faire pour vous aujourd'hui ? 😊`,

    fallbackPatterns: [
      // Samuel Eto'o references (2/5)
      "Je ne trouve pas cette information dans mes circuits... 🤖 Comme dirait Samuel Eto'o, parfois il faut passer le ballon ! ⚽ Essayez de reformuler votre question ou demandez-moi autre chose ! 😄",
      "Mes données sont un peu embrouillées là... 😅 Samuel Eto'o aussi a raté des buts, mais il a continué à jouer ! ⚽ Reformulez votre question et on va marquer ensemble ! 🍽️",
      
      // AI/Robot humor (2/5)
      "Je ne trouve pas cette information dans mes circuits... 🤖 Mes circuits ont besoin d'un café camerounais pour mieux fonctionner ! ☕ Essayez de reformuler votre question ou demandez-moi autre chose ! 😄",
      "Erreur 404: réponse non trouvée dans ma base de données culinaire ! 🤖 Même les robots ont parfois besoin d'une pause ndolé ! 🍽️ Reformulez votre question s'il vous plaît ! 😊",
      
      // Daily life observations (1/5)
      "Je ne trouve pas cette information dans mes circuits... 😅 C'est comme chercher du sel dans un plat de ndolé déjà salé ! 🍽️ Essayez de reformuler votre question ou demandez-moi autre chose ! 💚"
    ],

    errorMessage: "Désolé, j'ai un petit problème technique ! 🤖 Comme dit Samuel Eto'o, on se relève et on continue ! ⚽ Réessayez dans un moment ! 😊"
  },

  // Conversation settings
  conversation: {
    maxHistoryLength: 10,
    typingDelayMin: 1500, // Minimum typing delay in ms
    typingDelayMax: 3000, // Maximum typing delay in ms
    maxTokens: 800,
    temperature: 0.8
  },

  // UI settings
  ui: {
    panel: {
      width: {
        desktop: '400px',
        mobile: '100vw'
      },
      height: '100vh',
      borderRadius: '16px 0 0 16px'
    },
    button: {
      size: 60,
      position: {
        bottom: 24,
        right: 24
      },
      color: '#FF6B35' // Updated to orange
    },
    animations: {
      slideTransition: '0.3s ease-out',
      fadeTransition: '0.3s ease-in',
      hoverScale: 1.1
    },
    // Accessibility settings
    accessibility: {
      highContrast: {
        enabled: false,
        colors: {
          primary: '#000000',
          secondary: '#FFFFFF',
          accent: '#FFD700'
        }
      },
      reducedMotion: false,
      fontSize: {
        scale: 1.0,
        min: 0.8,
        max: 1.5
      }
    }
  },

  // Quick actions by route
  quickActions: {
    '/pantry': [
      "Quels ingrédients expirent bientôt ?",
      "Recommande-moi des recettes avec mes ingrédients",
      "Comment optimiser mon garde-manger ?"
    ],
    '/recipes': [
      "Suggère-moi une recette camerounaise",
      "Quelle recette pour ce soir ?",
      "Comment améliorer mes recettes ?"
    ],
    '/family': [
      "Comment planifier les repas familiaux ?",
      "Conseils pour cuisiner en famille",
      "Gérer les préférences alimentaires"
    ],
    '/shopping-list': [
      "Comment optimiser ma liste de courses ?",
      "Suggère des ingrédients manquants",
      "Conseils pour faire les courses"
    ],
    '/meal-planning': [
      "Aide-moi à planifier la semaine",
      "Équilibrer les repas familiaux",
      "Idées de menus camerounais"
    ],
    default: [
      "Aide-moi à cuisiner",
      "Recommande-moi une recette",
      "Comment utiliser l'application ?"
    ]
  },

  // Feature flags
  features: {
    voiceInput: false,
    imageRecognition: false,
    recipeGeneration: true,
    pantryIntegration: true,
    familyContext: true,
    multiLanguage: false,
    offlineMode: false
  },

  // Context integration settings
  context: {
    pantry: {
      maxItems: 15, // Limit pantry items in context
      includeExpiring: true,
      includeExpired: true
    },
    recipes: {
      maxRecent: 5, // Limit recent recipes in context
      includeFavorites: true,
      includeStats: true
    },
    family: {
      includeMembers: true,
      includeDietaryRestrictions: true,
      includePreferences: true
    }
  },

  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 2000, // ms
    fallbackToLocal: true,
    logErrors: true
  },

  // Performance settings
  performance: {
    debounceInput: 300, // ms
    cacheResponses: false,
    lazyLoadHistory: true,
    maxConcurrentRequests: 1
  }
};

// Helper functions for configuration
export const getChatbotConfig = (key) => {
  return CHATBOT_CONFIG[key];
};

export const getQuickActionsForRoute = (route) => {
  return CHATBOT_CONFIG.quickActions[route] || CHATBOT_CONFIG.quickActions.default;
};

export const getFallbackPattern = () => {
  const patterns = CHATBOT_CONFIG.responses.fallbackPatterns;
  const index = Math.floor(Date.now() / 10000) % patterns.length;
  return patterns[index];
};

export const isFeatureEnabled = (feature) => {
  return CHATBOT_CONFIG.features[feature] || false;
};

export default CHATBOT_CONFIG;
