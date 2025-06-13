/**
 * Chatbot Service for MiamBidi
 * Manages conversation context and integrates with application data
 */

import { generateChatbotResponse } from './deepseekService';

/**
 * Chatbot conversation manager
 */
class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    this.isTyping = false;
  }

  /**
   * Send message to chatbot and get response
   * @param {string} message - User message
   * @param {Object} appContext - Application context data
   * @returns {Promise<Object>} - Response object
   */
  async sendMessage(message, appContext = {}) {
    if (!message || message.trim().length === 0) {
      throw new Error('Message vide');
    }

    // Add user message to history
    this.addToHistory('user', message);

    try {
      this.isTyping = true;

      // Build comprehensive context from app data
      const context = this.buildAppContext(appContext);

      // Get AI response
      const aiResponse = await generateChatbotResponse(
        message,
        context,
        this.conversationHistory
      );

      // Add AI response to history
      this.addToHistory('assistant', aiResponse);

      return {
        success: true,
        message: aiResponse,
        timestamp: new Date().toISOString(),
        conversationId: this.getConversationId()
      };

    } catch (error) {
      console.error('Chatbot service error:', error);
      
      // Generate fallback response
      const fallbackResponse = this.generateLocalFallback(message);
      this.addToHistory('assistant', fallbackResponse);

      return {
        success: false,
        message: fallbackResponse,
        timestamp: new Date().toISOString(),
        error: error.message,
        conversationId: this.getConversationId()
      };
    } finally {
      this.isTyping = false;
    }
  }

  /**
   * Build application context for AI
   * @param {Object} appContext - Raw application context
   * @returns {Object} - Formatted context
   */
  buildAppContext(appContext) {
    const {
      pantryContext = {},
      recipeContext = {},
      familyContext = {},
      currentRoute = ''
    } = appContext;

    // Extract pantry data
    const pantryStats = pantryContext.getPantryStats ? pantryContext.getPantryStats() : {};
    const pantryItems = pantryContext.pantryItems || [];

    // Extract recipe data
    const allRecipes = recipeContext.getAllRecipes ? recipeContext.getAllRecipes() : [];
    const familyRecipes = recipeContext.getFamilyRecipes ? recipeContext.getFamilyRecipes() : [];
    
    const recipeStats = {
      totalRecipes: allRecipes.length,
      familyRecipes: familyRecipes.length,
      favoriteCount: allRecipes.filter(r => r.rating >= 4.5).length
    };

    // Extract family data
    const familyInfo = {
      name: familyContext.family?.name || familyContext.currentFamily?.name,
      memberCount: familyContext.familyMembers?.length || 0,
      currentRoute
    };

    return {
      pantryStats,
      recipeStats,
      familyInfo,
      pantryItems: pantryItems.slice(0, 15), // Limit for context size
      recentRecipes: allRecipes.slice(0, 5)
    };
  }

  /**
   * Add message to conversation history
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Maintain history limit
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Generate local fallback response when AI fails
   * @param {string} userMessage - Original user message
   * @returns {string} - Fallback response
   */
  generateLocalFallback(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Check for common questions and provide helpful responses
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return "Je suis là pour vous aider ! 😊 Demandez-moi des conseils de cuisine, des recommandations de recettes, ou des informations sur votre garde-manger. Que puis-je faire pour vous ? 🍽️";
    }

    if (lowerMessage.includes('recette') || lowerMessage.includes('recipe')) {
      return "J'adore parler de recettes ! 👨‍🍳 Dites-moi quels ingrédients vous avez ou quel type de plat vous voulez cuisiner, et je vous donnerai des suggestions délicieuses ! 🥘";
    }

    if (lowerMessage.includes('garde-manger') || lowerMessage.includes('pantry') || lowerMessage.includes('ingrédient')) {
      return "Votre garde-manger est la base d'une bonne cuisine ! 📦 Je peux vous aider à optimiser vos ingrédients et suggérer des recettes avec ce que vous avez. Que voulez-vous savoir ? 🌿";
    }

    if (lowerMessage.includes('famille') || lowerMessage.includes('family')) {
      return "La cuisine en famille, c'est le bonheur ! 👨‍👩‍👧‍👦 Je peux vous aider à planifier des repas pour toute la famille. Combien êtes-vous à table ? 🍽️";
    }

    // Default humorous fallback
    const fallbacks = [
      "Hmm, je n'ai pas bien compris... 🤔 C'est comme essayer de faire du ndolé sans feuilles ! 😅 Pouvez-vous reformuler votre question ? 🍃",
      "Ma compréhension a besoin d'un petit coup de piment ! 🌶️ Essayez de me poser votre question différemment, je ferai de mon mieux ! 😊",
      "Je suis un peu perdu comme un touriste au marché de Mokolo ! 😄 Reformulez votre question et je vous aiderai avec plaisir ! 🛒"
    ];

    const randomIndex = Math.floor(Math.random() * fallbacks.length);
    return fallbacks[randomIndex];
  }

  /**
   * Get conversation ID for tracking
   * @returns {string} - Conversation identifier
   */
  getConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   * @returns {Array} - Conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Check if chatbot is currently typing
   * @returns {boolean} - Typing status
   */
  getTypingStatus() {
    return this.isTyping;
  }

  /**
   * Get conversation statistics
   * @returns {Object} - Conversation stats
   */
  getStats() {
    const userMessages = this.conversationHistory.filter(msg => msg.role === 'user').length;
    const assistantMessages = this.conversationHistory.filter(msg => msg.role === 'assistant').length;

    return {
      totalMessages: this.conversationHistory.length,
      userMessages,
      assistantMessages,
      conversationStarted: this.conversationHistory.length > 0 ? this.conversationHistory[0].timestamp : null
    };
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService;

// Named exports for specific functions
export {
  ChatbotService
};
