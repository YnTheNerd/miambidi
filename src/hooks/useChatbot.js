/**
 * Chatbot Hook for MiamBidi
 * Manages chatbot state and integrates with application contexts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import chatbotService from '../services/chatbotService';
import { usePantry } from '../contexts/PantryContext';
import { useRecipes } from '../contexts/RecipeContext';
import { useFamily } from '../contexts/FirestoreFamilyContext';
import { useLocation } from 'react-router-dom';

export const useChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Application contexts
  const pantryContext = usePantry();
  const recipeContext = useRecipes();
  const familyContext = useFamily();
  const location = useLocation();

  // Refs for auto-scroll
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  /**
   * Scroll to bottom of chat
   */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  /**
   * Auto-scroll when messages change
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Initialize chatbot with welcome message
   */
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Salut ! 👋 Je suis votre Assistant Culinaire MiamBidi ! 🍽️\n\nJe peux vous aider avec :\n• Recommandations de recettes 👨‍🍳\n• Gestion du garde-manger 📦\n• Conseils de cuisine camerounaise 🇨🇲\n• Navigation dans l'application 📱\n\nQue puis-je faire pour vous aujourd'hui ? 😊`,
        timestamp: new Date().toISOString(),
        isWelcome: true
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  /**
   * Send message to chatbot
   */
  const sendMessage = useCallback(async (message) => {
    if (!message || message.trim().length === 0) {
      return;
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Minimum typing delay for realism
      const typingDelay = new Promise(resolve => setTimeout(resolve, 1500));

      // Build application context
      const appContext = {
        pantryContext,
        recipeContext,
        familyContext,
        currentRoute: location.pathname
      };

      // Get response from chatbot service
      const [response] = await Promise.all([
        chatbotService.sendMessage(message, appContext),
        typingDelay
      ]);

      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
        success: response.success,
        conversationId: response.conversationId
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!response.success) {
        setError(response.error);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "Désolé, j'ai un petit problème technique ! 🤖 Comme dit Samuel Eto'o, on se relève et on continue ! ⚽ Réessayez dans un moment ! 😊",
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [pantryContext, recipeContext, familyContext, location.pathname]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((value) => {
    setInputValue(value);
  }, []);

  /**
   * Handle input submit
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  }, [inputValue, isLoading, sendMessage]);

  /**
   * Toggle chatbot panel
   */
  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => !prev);
    setError(null);
  }, []);

  /**
   * Open chatbot panel
   */
  const openChatbot = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  /**
   * Close chatbot panel
   */
  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  /**
   * Clear conversation
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    chatbotService.clearHistory();
    setError(null);
    setInputValue('');
  }, []);

  /**
   * Get quick action suggestions based on current context
   */
  const getQuickActions = useCallback(() => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/pantry')) {
      return [
        "Quels ingrédients expirent bientôt ?",
        "Recommande-moi des recettes avec mes ingrédients",
        "Comment optimiser mon garde-manger ?"
      ];
    }
    
    if (currentPath.includes('/recipes')) {
      return [
        "Suggère-moi une recette camerounaise",
        "Quelle recette pour ce soir ?",
        "Comment améliorer mes recettes ?"
      ];
    }
    
    if (currentPath.includes('/family')) {
      return [
        "Comment planifier les repas familiaux ?",
        "Conseils pour cuisiner en famille",
        "Gérer les préférences alimentaires"
      ];
    }

    return [
      "Aide-moi à cuisiner",
      "Recommande-moi une recette",
      "Comment utiliser l'application ?"
    ];
  }, [location.pathname]);

  /**
   * Get conversation statistics
   */
  const getStats = useCallback(() => {
    return {
      messageCount: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length,
      hasError: !!error,
      isActive: isOpen
    };
  }, [messages, error, isOpen]);

  return {
    // State
    isOpen,
    messages,
    isTyping,
    inputValue,
    error,
    isLoading,

    // Actions
    sendMessage,
    handleInputChange,
    handleSubmit,
    toggleChatbot,
    openChatbot,
    closeChatbot,
    clearConversation,

    // Utilities
    getQuickActions,
    getStats,
    scrollToBottom,

    // Refs
    messagesEndRef,
    chatContainerRef
  };
};
