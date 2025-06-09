/**
 * Shopping List Context for State Management
 * Handles shopping list generation, item management, and future Firebase sync
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateShoppingList } from '../utils/shoppingListGenerator.js';
import { GROCERY_CATEGORIES } from '../types/shoppingList.js';

const ShoppingListContext = createContext();

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
}

export function ShoppingListProvider({ children }) {
  const [currentShoppingList, setCurrentShoppingList] = useState(null);
  const [shoppingLists, setShoppingLists] = useState([]); // Historical lists
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generates a new shopping list from meal plan data
   * @param {object} mealPlan - Meal plan from DragDropMealCalendar
   * @param {array} allRecipes - All available recipes
   * @param {object} options - Generation options
   */
  const generateNewShoppingList = useCallback(async (mealPlan, allRecipes, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const newShoppingList = generateShoppingList(mealPlan, allRecipes, options);
      setCurrentShoppingList(newShoppingList);

      // Add to historical lists
      setShoppingLists(prev => [newShoppingList, ...prev]);

      return newShoppingList;
    } catch (err) {
      setError(`Erreur lors de la génération de la liste: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggles completion status of a shopping list item
   * @param {string} itemId - Item ID
   * @param {string} category - Item category
   * @param {boolean} isCompleted - New completion status
   * @param {string} completedBy - User who completed the item
   */
  const toggleItemCompletion = useCallback((itemId, category, isCompleted, completedBy = 'current-user') => {
    if (!currentShoppingList) return;

    setCurrentShoppingList(prev => {
      const updatedList = { ...prev };
      const categoryItems = [...updatedList.categories[category]];

      const itemIndex = categoryItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;

      categoryItems[itemIndex] = {
        ...categoryItems[itemIndex],
        isCompleted,
        completedBy: isCompleted ? completedBy : null,
        completedAt: isCompleted ? new Date().toISOString() : null
      };

      updatedList.categories[category] = categoryItems;
      updatedList.lastModified = new Date().toISOString();

      // Recalculate stats
      const totalItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.length, 0);
      const completedItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.filter(item => item.isCompleted).length, 0);

      updatedList.stats = {
        ...updatedList.stats,
        completedItems,
        completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      };

      return updatedList;
    });
  }, [currentShoppingList]);

  /**
   * Updates item notes
   * @param {string} itemId - Item ID
   * @param {string} category - Item category
   * @param {string} notes - New notes
   */
  const updateItemNotes = useCallback((itemId, category, notes) => {
    if (!currentShoppingList) return;

    setCurrentShoppingList(prev => {
      const updatedList = { ...prev };
      const categoryItems = [...updatedList.categories[category]];

      const itemIndex = categoryItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;

      categoryItems[itemIndex] = {
        ...categoryItems[itemIndex],
        notes
      };

      updatedList.categories[category] = categoryItems;
      updatedList.lastModified = new Date().toISOString();

      return updatedList;
    });
  }, [currentShoppingList]);

  /**
   * Marks all items in a category as completed/uncompleted
   * @param {string} category - Category name
   * @param {boolean} isCompleted - Completion status
   * @param {string} completedBy - User who completed the items
   */
  const toggleCategoryCompletion = useCallback((category, isCompleted, completedBy = 'current-user') => {
    if (!currentShoppingList || !currentShoppingList.categories[category]) return;

    setCurrentShoppingList(prev => {
      const updatedList = { ...prev };
      const categoryItems = updatedList.categories[category].map(item => ({
        ...item,
        isCompleted,
        completedBy: isCompleted ? completedBy : null,
        completedAt: isCompleted ? new Date().toISOString() : null
      }));

      updatedList.categories[category] = categoryItems;
      updatedList.lastModified = new Date().toISOString();

      // Recalculate stats
      const totalItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.length, 0);
      const completedItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.filter(item => item.isCompleted).length, 0);

      updatedList.stats = {
        ...updatedList.stats,
        completedItems,
        completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      };

      return updatedList;
    });
  }, [currentShoppingList]);

  /**
   * Clears all completed items from the shopping list
   */
  const clearCompletedItems = useCallback(() => {
    if (!currentShoppingList) return;

    setCurrentShoppingList(prev => {
      const updatedList = { ...prev };

      Object.keys(updatedList.categories).forEach(category => {
        updatedList.categories[category] = updatedList.categories[category]
          .filter(item => !item.isCompleted);
      });

      updatedList.lastModified = new Date().toISOString();

      // Recalculate stats
      const totalItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.length, 0);

      updatedList.stats = {
        ...updatedList.stats,
        totalItems,
        completedItems: 0,
        completionPercentage: 0
      };

      return updatedList;
    });
  }, [currentShoppingList]);

  /**
   * Clears completed items from a specific category
   * @param {string} categoryName - Name of the category to clear
   */
  const clearCompletedItemsInCategory = useCallback((categoryName) => {
    if (!currentShoppingList || !currentShoppingList.categories[categoryName]) return;

    setCurrentShoppingList(prev => {
      const updatedList = { ...prev };

      // Filter out completed items from the specific category
      updatedList.categories[categoryName] = updatedList.categories[categoryName]
        .filter(item => !item.isCompleted);

      updatedList.lastModified = new Date().toISOString();

      // Recalculate stats
      const totalItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.length, 0);
      const completedItems = Object.values(updatedList.categories)
        .reduce((sum, items) => sum + items.filter(item => item.isCompleted).length, 0);

      updatedList.stats = {
        ...updatedList.stats,
        totalItems,
        completedItems,
        completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      };

      return updatedList;
    });
  }, [currentShoppingList]);

  /**
   * Gets shopping list statistics
   * @returns {object} - Statistics object
   */
  const getShoppingListStats = useCallback(() => {
    if (!currentShoppingList) {
      return {
        totalItems: 0,
        completedItems: 0,
        totalRecipes: 0,
        completionPercentage: 0,
        categoriesWithItems: 0
      };
    }

    const categoriesWithItems = Object.values(currentShoppingList.categories)
      .filter(items => items.length > 0).length;

    return {
      ...currentShoppingList.stats,
      categoriesWithItems
    };
  }, [currentShoppingList]);

  /**
   * Exports shopping list for sharing/printing
   * @param {string} format - Export format ('text', 'json')
   * @returns {string} - Formatted shopping list
   */
  const exportShoppingList = useCallback((format = 'text') => {
    if (!currentShoppingList) return '';

    if (format === 'json') {
      return JSON.stringify(currentShoppingList, null, 2);
    }

    // Text format
    let output = `${currentShoppingList.title}\n`;
    output += `Généré le ${new Date(currentShoppingList.createdAt).toLocaleDateString('fr-FR')}\n\n`;

    Object.entries(currentShoppingList.categories).forEach(([category, items]) => {
      if (items.length > 0) {
        const categoryInfo = GROCERY_CATEGORIES[category];
        output += `${categoryInfo?.icon || '📦'} ${category.toUpperCase()}\n`;

        items.forEach(item => {
          const status = item.isCompleted ? '✅' : '⬜';
          output += `${status} ${item.quantity} ${item.unit} ${item.name}`;
          if (item.notes) {
            output += ` (${item.notes})`;
          }
          output += '\n';
        });
        output += '\n';
      }
    });

    return output;
  }, [currentShoppingList]);

  /**
   * Generates enhanced email content with professional formatting
   * @param {object} familyData - Family data for personalization
   * @returns {string} - Formatted email content
   */
  const generateEnhancedEmailContent = useCallback((familyData = null) => {
    if (!currentShoppingList) return '';

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let emailContent = '';

    // Email header
    emailContent += `Bonjour${familyData?.name ? ` famille ${familyData.name}` : ''} ! 👋\n\n`;
    emailContent += `Voici votre liste de courses générée automatiquement par MiamBidi.\n\n`;

    // List details
    emailContent += `📋 ${currentShoppingList.title}\n`;
    emailContent += `📅 Générée le ${new Date(currentShoppingList.createdAt).toLocaleDateString('fr-FR')}\n`;
    emailContent += `📧 Envoyée le ${currentDate}\n\n`;

    // Statistics
    const stats = getShoppingListStats();
    emailContent += `📊 RÉSUMÉ DE LA LISTE\n`;
    emailContent += `• ${stats.totalItems} articles au total\n`;
    emailContent += `• ${stats.totalRecipes} recettes planifiées\n`;
    emailContent += `• ${stats.categoriesWithItems} catégories d'aliments\n\n`;

    emailContent += `═══════════════════════════════════════\n\n`;

    // Categories and items
    Object.entries(currentShoppingList.categories).forEach(([category, items]) => {
      if (items.length > 0) {
        const categoryInfo = GROCERY_CATEGORIES[category];
        emailContent += `${categoryInfo?.icon || '📦'} ${category.toUpperCase()}\n`;
        emailContent += `${'─'.repeat(category.length + 2)}\n`;

        items.forEach(item => {
          const status = item.isCompleted ? '✅' : '⬜';
          emailContent += `${status} ${item.quantity} ${item.unit} ${item.name}`;
          if (item.notes) {
            emailContent += ` (${item.notes})`;
          }
          emailContent += '\n';
        });
        emailContent += '\n';
      }
    });

    // Footer
    emailContent += `═══════════════════════════════════════\n\n`;
    emailContent += `💡 CONSEILS POUR VOS COURSES\n`;
    emailContent += `• Vérifiez votre garde-manger avant de partir\n`;
    emailContent += `• Apportez des sacs réutilisables\n`;
    emailContent += `• Respectez votre budget prévu\n`;
    emailContent += `• Cochez les articles au fur et à mesure\n\n`;

    emailContent += `🍽️ Bon appétit et bonnes courses !\n\n`;
    emailContent += `---\n`;
    emailContent += `Cette liste a été générée automatiquement par MiamBidi\n`;
    emailContent += `Application de planification de repas pour familles\n`;
    emailContent += `💚 Mangez bien, planifiez mieux !`;

    return emailContent;
  }, [currentShoppingList, getShoppingListStats]);

  /**
   * Validates email addresses
   * @param {array} emails - Array of email addresses to validate
   * @returns {object} - Validation result with valid and invalid emails
   */
  const validateEmailAddresses = useCallback((emails = []) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = [];
    const invalidEmails = [];

    emails.forEach(email => {
      const trimmedEmail = email.trim();
      if (emailRegex.test(trimmedEmail)) {
        validEmails.push(trimmedEmail);
      } else {
        invalidEmails.push(trimmedEmail);
      }
    });

    return {
      validEmails,
      invalidEmails,
      isValid: invalidEmails.length === 0 && validEmails.length > 0
    };
  }, []);

  /**
   * Generates a filename for the shopping list file
   * @param {string} extension - File extension (default: 'txt')
   * @returns {string} - Generated filename
   */
  const generateShoppingListFilename = useCallback((extension = 'txt') => {
    if (!currentShoppingList) return `Liste_de_Courses_MiamBidi.${extension}`;

    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    const listName = currentShoppingList.title
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 30); // Limit length

    return `Liste_de_Courses_${listName}_${date}.${extension}`;
  }, [currentShoppingList]);

  /**
   * Generates enhanced file content for shopping list
   * @param {object} familyData - Family data for personalization
   * @returns {string} - Formatted file content
   */
  const generateShoppingListFileContent = useCallback((familyData = null) => {
    if (!currentShoppingList) return '';

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let fileContent = '';

    // File header
    fileContent += `═══════════════════════════════════════\n`;
    fileContent += `           LISTE DE COURSES MIAMBIDI\n`;
    fileContent += `═══════════════════════════════════════\n\n`;

    fileContent += `📋 ${currentShoppingList.title}\n`;
    fileContent += `👨‍👩‍👧‍👦 Famille: ${familyData?.name || 'Votre Famille'}\n`;
    fileContent += `📅 Générée le: ${new Date(currentShoppingList.createdAt).toLocaleDateString('fr-FR')}\n`;
    fileContent += `📧 Exportée le: ${currentDate}\n\n`;

    // Statistics
    const stats = getShoppingListStats();
    fileContent += `📊 RÉSUMÉ DE LA LISTE\n`;
    fileContent += `${'─'.repeat(25)}\n`;
    fileContent += `• Articles au total: ${stats.totalItems}\n`;
    fileContent += `• Recettes planifiées: ${stats.totalRecipes}\n`;
    fileContent += `• Catégories d'aliments: ${stats.categoriesWithItems}\n`;
    fileContent += `• Progression: ${stats.completionPercentage}% complété\n\n`;

    fileContent += `═══════════════════════════════════════\n`;
    fileContent += `                ARTICLES\n`;
    fileContent += `═══════════════════════════════════════\n\n`;

    // Categories and items
    Object.entries(currentShoppingList.categories).forEach(([category, items]) => {
      if (items.length > 0) {
        const categoryInfo = GROCERY_CATEGORIES[category];
        fileContent += `${categoryInfo?.icon || '📦'} ${category.toUpperCase()}\n`;
        fileContent += `${'─'.repeat(category.length + 2)}\n`;

        items.forEach(item => {
          const status = item.isCompleted ? '✅' : '⬜';
          fileContent += `${status} ${item.quantity} ${item.unit} ${item.name}`;
          if (item.notes) {
            fileContent += ` (${item.notes})`;
          }
          fileContent += '\n';
        });
        fileContent += '\n';
      }
    });

    // Footer with tips
    fileContent += `═══════════════════════════════════════\n`;
    fileContent += `            CONSEILS PRATIQUES\n`;
    fileContent += `═══════════════════════════════════════\n\n`;
    fileContent += `💡 CONSEILS POUR VOS COURSES:\n`;
    fileContent += `• Vérifiez votre garde-manger avant de partir\n`;
    fileContent += `• Apportez des sacs réutilisables\n`;
    fileContent += `• Respectez votre budget prévu\n`;
    fileContent += `• Cochez les articles au fur et à mesure\n`;
    fileContent += `• Gardez les produits frais pour la fin\n\n`;

    fileContent += `🛒 ORGANISATION DES COURSES:\n`;
    fileContent += `• Commencez par les produits non périssables\n`;
    fileContent += `• Passez aux fruits et légumes\n`;
    fileContent += `• Terminez par les produits frais et surgelés\n`;
    fileContent += `• Vérifiez les dates de péremption\n\n`;

    fileContent += `═══════════════════════════════════════\n\n`;
    fileContent += `🍽️ Bon appétit et bonnes courses !\n\n`;
    fileContent += `---\n`;
    fileContent += `Cette liste a été générée automatiquement par MiamBidi\n`;
    fileContent += `Application de planification de repas pour familles\n`;
    fileContent += `💚 Mangez bien, planifiez mieux !\n`;
    fileContent += `\n`;
    fileContent += `Pour plus d'informations: https://miambidi.com\n`;
    fileContent += `Support: support@miambidi.com\n`;

    return fileContent;
  }, [currentShoppingList, getShoppingListStats]);

  /**
   * Downloads shopping list as a file
   * @param {object} familyData - Family data for personalization
   * @returns {object} - Result object with success status and message
   */
  const downloadShoppingListFile = useCallback((familyData = null) => {
    if (!currentShoppingList) {
      return {
        success: false,
        message: 'Aucune liste de courses à télécharger'
      };
    }

    try {
      const fileContent = generateShoppingListFileContent(familyData);
      const filename = generateShoppingListFilename('txt');

      // Create blob and download
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      // Create temporary download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';

      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up URL
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Fichier "${filename}" téléchargé avec succès`,
        filename
      };
    } catch (error) {
      console.error('Error downloading shopping list file:', error);
      return {
        success: false,
        message: 'Erreur lors du téléchargement du fichier'
      };
    }
  }, [currentShoppingList, generateShoppingListFileContent, generateShoppingListFilename]);

  /**
   * Shares shopping list with family via email
   * @param {array} familyEmails - Array of family member email addresses
   * @param {object} familyData - Family data for enhanced email formatting
   * @returns {object} - Result object with success status and message
   */
  const shareWithFamilyEmail = useCallback((familyEmails = [], familyData = null) => {
    if (!currentShoppingList) {
      return {
        success: false,
        message: 'Aucune liste de courses à partager'
      };
    }

    if (familyEmails.length === 0) {
      return {
        success: false,
        message: 'Aucune adresse email de famille trouvée. Vérifiez que les membres de votre famille ont des adresses email configurées.'
      };
    }

    // Validate email addresses
    const emailValidation = validateEmailAddresses(familyEmails);

    if (!emailValidation.isValid) {
      return {
        success: false,
        message: `Adresses email invalides détectées: ${emailValidation.invalidEmails.join(', ')}. Vérifiez les adresses email des membres de votre famille.`
      };
    }

    try {
      // Generate enhanced email content
      const emailBody = generateEnhancedEmailContent(familyData);
      const subject = encodeURIComponent(`Liste de Courses - MiamBidi${familyData?.name ? ` (${familyData.name})` : ''}`);
      const body = encodeURIComponent(emailBody);
      const recipients = emailValidation.validEmails.join(',');

      const mailtoLink = `mailto:${recipients}?subject=${subject}&body=${body}`;

      // Check if the mailto link is too long (some email clients have limits)
      if (mailtoLink.length > 2000) {
        return {
          success: false,
          message: 'La liste de courses est trop longue pour être envoyée par email. Essayez d\'exporter et d\'attacher le fichier.'
        };
      }

      // Open the email client
      window.location.href = mailtoLink;

      return {
        success: true,
        message: `Client email ouvert avec la liste de courses pour ${emailValidation.validEmails.length} membre(s) de la famille`
      };
    } catch (error) {
      console.error('Error sharing shopping list:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'ouverture du client email. Vérifiez que vous avez un client email configuré.'
      };
    }
  }, [currentShoppingList]);

  /**
   * Shares shopping list with family via email with file attachment
   * Two-step process: 1) Download file, 2) Open email with instructions
   * @param {array} familyEmails - Array of family member email addresses
   * @param {object} familyData - Family data for enhanced email formatting
   * @returns {object} - Result object with success status and message
   */
  const shareWithFamilyEmailAttachment = useCallback((familyEmails = [], familyData = null) => {
    if (!currentShoppingList) {
      return {
        success: false,
        message: 'Aucune liste de courses à partager'
      };
    }

    if (familyEmails.length === 0) {
      return {
        success: false,
        message: 'Aucune adresse email de famille trouvée. Vérifiez que les membres de votre famille ont des adresses email configurées.'
      };
    }

    // Validate email addresses
    const emailValidation = validateEmailAddresses(familyEmails);

    if (!emailValidation.isValid) {
      return {
        success: false,
        message: `Adresses email invalides détectées: ${emailValidation.invalidEmails.join(', ')}. Vérifiez les adresses email des membres de votre famille.`
      };
    }

    try {
      // Step 1: Download the shopping list file
      const downloadResult = downloadShoppingListFile(familyData);

      if (!downloadResult.success) {
        return downloadResult;
      }

      // Step 2: Generate email content with attachment instructions
      const emailBody = generateEmailWithAttachmentInstructions(familyData, downloadResult.filename);
      const subject = encodeURIComponent('Liste de Courses - MiamBidi');
      const body = encodeURIComponent(emailBody);
      const recipients = emailValidation.validEmails.join(',');

      const mailtoLink = `mailto:${recipients}?subject=${subject}&body=${body}`;

      console.log('Generated mailto link length:', mailtoLink.length);
      console.log('Recipients:', recipients);
      console.log('Subject:', subject);

      // Check if the mailto link is too long (most email clients have a 2000-2048 character limit)
      if (mailtoLink.length > 1900) {
        console.warn('Mailto link too long, using simplified email content');
        const simplifiedBody = generateSimplifiedEmailContent(familyData, downloadResult.filename);
        const simplifiedEncodedBody = encodeURIComponent(simplifiedBody);
        const simplifiedMailtoLink = `mailto:${recipients}?subject=${subject}&body=${simplifiedEncodedBody}`;

        // Small delay to ensure file download completes before opening email
        setTimeout(() => {
          try {
            window.open(simplifiedMailtoLink, '_self');
          } catch (error) {
            console.error('Error opening email client:', error);
            // Fallback: try with window.location
            window.location.href = simplifiedMailtoLink;
          }
        }, 800);
      } else {
        // Small delay to ensure file download completes before opening email
        setTimeout(() => {
          try {
            window.open(mailtoLink, '_self');
          } catch (error) {
            console.error('Error opening email client:', error);
            // Fallback: try with window.location
            window.location.href = mailtoLink;
          }
        }, 800);
      }

      return {
        success: true,
        message: `Fichier téléchargé et client email ouvert pour ${emailValidation.validEmails.length} membre(s) de la famille`,
        filename: downloadResult.filename
      };
    } catch (error) {
      console.error('Error sharing shopping list with attachment:', error);
      return {
        success: false,
        message: 'Erreur lors du partage de la liste de courses avec pièce jointe.'
      };
    }
  }, [currentShoppingList, validateEmailAddresses, downloadShoppingListFile]);

  /**
   * Generates email content with file attachment instructions
   * @param {object} familyData - Family data for personalization
   * @param {string} filename - Name of the downloaded file
   * @returns {string} - Formatted email content with instructions
   */
  const generateEmailWithAttachmentInstructions = useCallback((familyData = null, filename = '') => {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let emailContent = '';

    // Professional greeting
    emailContent += `Bonjour${familyData?.name ? ` famille ${familyData.name}` : ''} ! 👋\n\n`;

    // Main message
    emailContent += `Voici votre liste de courses MiamBidi en pièce jointe.\n\n`;

    // File information
    emailContent += `📎 FICHIER JOINT\n`;
    emailContent += `${'─'.repeat(20)}\n`;
    emailContent += `• Nom du fichier: ${filename}\n`;
    emailContent += `• Format: Fichier texte (.txt)\n`;
    emailContent += `• Généré le: ${currentDate}\n`;
    emailContent += `• Contenu: Liste de courses complète avec catégories\n\n`;

    // Instructions for attachment
    emailContent += `📋 INSTRUCTIONS POUR JOINDRE LE FICHIER\n`;
    emailContent += `${'─'.repeat(40)}\n`;
    emailContent += `1. Le fichier "${filename}" a été automatiquement téléchargé\n`;
    emailContent += `2. Recherchez-le dans votre dossier "Téléchargements"\n`;
    emailContent += `3. Glissez-déposez le fichier dans cet email OU\n`;
    emailContent += `4. Cliquez sur "Joindre un fichier" et sélectionnez le fichier\n`;
    emailContent += `5. Envoyez l'email à votre famille\n\n`;

    // Alternative access methods
    emailContent += `💡 AUTRES OPTIONS D'ACCÈS\n`;
    emailContent += `${'─'.repeat(25)}\n`;
    emailContent += `• Ouvrez le fichier avec n'importe quel éditeur de texte\n`;
    emailContent += `• Imprimez la liste directement depuis le fichier\n`;
    emailContent += `• Partagez le fichier via WhatsApp, Telegram, etc.\n`;
    emailContent += `• Copiez le contenu dans une note sur votre téléphone\n\n`;

    // Shopping tips
    emailContent += `🛒 CONSEILS POUR VOS COURSES\n`;
    emailContent += `${'─'.repeat(30)}\n`;
    emailContent += `• Vérifiez votre garde-manger avant de partir\n`;
    emailContent += `• Apportez des sacs réutilisables\n`;
    emailContent += `• Respectez votre budget prévu\n`;
    emailContent += `• Cochez les articles au fur et à mesure\n\n`;

    // Footer
    emailContent += `🍽️ Bon appétit et bonnes courses !\n\n`;
    emailContent += `---\n`;
    emailContent += `Cette liste a été générée automatiquement par MiamBidi\n`;
    emailContent += `Application de planification de repas pour familles\n`;
    emailContent += `💚 Mangez bien, planifiez mieux !\n\n`;

    emailContent += `Support technique: support@miambidi.com\n`;
    emailContent += `Site web: https://miambidi.com`;

    return emailContent;
  }, []);

  /**
   * Generates simplified email content for cases where full content is too long
   * @param {object} familyData - Family data for personalization
   * @param {string} filename - Name of the downloaded file
   * @returns {string} - Simplified email content
   */
  const generateSimplifiedEmailContent = useCallback((familyData = null, filename = '') => {
    let emailContent = '';

    // Simplified greeting
    emailContent += `Bonjour${familyData?.name ? ` famille ${familyData.name}` : ''} !\n\n`;

    // Main message
    emailContent += `Voici votre liste de courses MiamBidi.\n\n`;

    // File information
    emailContent += `📎 FICHIER JOINT: ${filename}\n\n`;

    // Simplified instructions
    emailContent += `INSTRUCTIONS:\n`;
    emailContent += `1. Le fichier a été téléchargé automatiquement\n`;
    emailContent += `2. Recherchez-le dans "Téléchargements"\n`;
    emailContent += `3. Joignez le fichier à cet email\n`;
    emailContent += `4. Envoyez à votre famille\n\n`;

    // Footer
    emailContent += `Bon appétit et bonnes courses !\n\n`;
    emailContent += `MiamBidi - Application de planification de repas`;

    return emailContent;
  }, []);

  // Future Firebase integration methods (placeholders)
  const saveToFirebase = useCallback(async () => {
    // TODO: Implement Firebase save
    console.log('Saving to Firebase...');
  }, [currentShoppingList]);

  const loadFromFirebase = useCallback(async (listId) => {
    // TODO: Implement Firebase load
    console.log('Loading from Firebase...', listId);
  }, []);

  const shareWithFamily = useCallback(async (familyMemberIds) => {
    // TODO: Implement family sharing
    console.log('Sharing with family...', familyMemberIds);
  }, [currentShoppingList]);

  const value = {
    // State
    currentShoppingList,
    shoppingLists,
    loading,
    error,

    // Actions
    generateNewShoppingList,
    toggleItemCompletion,
    updateItemNotes,
    toggleCategoryCompletion,
    clearCompletedItems,
    clearCompletedItemsInCategory,
    getShoppingListStats,
    exportShoppingList,
    shareWithFamilyEmail,
    shareWithFamilyEmailAttachment,
    downloadShoppingListFile,
    generateShoppingListFilename,

    // Future Firebase integration
    saveToFirebase,
    loadFromFirebase,
    shareWithFamily
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export { ShoppingListContext };
export default ShoppingListContext;
