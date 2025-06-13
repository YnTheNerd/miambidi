/**
 * Recipe Email Sharing Service for MiamBidi
 * Handles AI-enhanced email sharing of recipes with PDF attachments
 */

import { generateRecipeWithDeepSeek } from './deepseekService.js';

/**
 * Generate AI-enhanced email content for recipe sharing
 * @param {Object} recipe - Recipe object
 * @param {Object} familyData - Family information
 * @returns {Promise<string>} - Generated email content
 */
export const generateRecipeEmailContent = async (recipe, familyData = null) => {
  if (!recipe) {
    throw new Error('Recette non fournie pour la génération d\'email');
  }

  try {
    // Create a prompt for AI to generate friendly email content
    const prompt = `Génère un email amical en français pour partager cette recette avec la famille:

Nom de la recette: ${recipe.name || 'Recette délicieuse'}
Description: ${recipe.description || 'Une recette savoureuse'}
Cuisine: ${recipe.cuisine || 'traditionnelle'}
Difficulté: ${recipe.difficulty || 'moyenne'}
Temps de préparation: ${recipe.prepTime || 'non spécifié'} minutes
Temps de cuisson: ${recipe.cookTime || 'non spécifié'} minutes
Portions: ${recipe.servings || 'non spécifié'}

Ingrédients principaux: ${recipe.ingredients?.slice(0, 5).map(ing => ing.name).join(', ') || 'ingrédients variés'}

Instructions pour l'email:
1. Commence par un salut chaleureux à la famille
2. Présente la recette de manière enthousiaste
3. Mentionne 2-3 points intéressants sur la recette (ingrédients, origine, facilité, etc.)
4. Ajoute une petite blague ou anecdote amusante liée à la cuisine ou au plat
5. Termine par une invitation à cuisiner ensemble
6. Garde un ton familial et bienveillant
7. Maximum 200 mots
8. Utilise des emojis appropriés

Réponds uniquement avec le contenu de l'email, sans guillemets ni formatage markdown.`;

    // Use OpenRouter/DeepSeek to generate email content
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`,
        'HTTP-Referer': 'http://localhost:5174',
        'X-Title': 'MiamBidi'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant familial chaleureux qui aide à partager des recettes. Tu écris des emails amicaux et enthousiastes en français pour encourager la cuisine en famille.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse API invalide');
    }

    let emailContent = data.choices[0].message.content.trim();

    // Add PDF attachment notice
    emailContent += '\n\n📎 Vous trouverez la recette complète en pièce jointe au format PDF.\n\n';
    
    // Add signature
    emailContent += 'Bon appétit ! 🍽️\n\n';
    emailContent += '---\n';
    emailContent += 'Partagé via MiamBidi\n';
    emailContent += 'Application de planification de repas familiale 💚';

    return emailContent;

  } catch (error) {
    console.error('Error generating recipe email content:', error);
    
    // Fallback to basic email content if AI fails
    return generateFallbackEmailContent(recipe, familyData);
  }
};

/**
 * Generate fallback email content when AI is unavailable
 * @param {Object} recipe - Recipe object
 * @param {Object} familyData - Family information
 * @returns {string} - Basic email content
 */
const generateFallbackEmailContent = (recipe, familyData = null) => {
  const familyName = familyData?.name || 'la famille';
  
  return `Salut ${familyName} ! 👋

Je partage avec vous une délicieuse recette : "${recipe.name || 'Recette savoureuse'}" !

🍽️ Cette recette ${recipe.cuisine || 'traditionnelle'} est parfaite pour ${recipe.servings || 'plusieurs'} personnes et prend environ ${recipe.prepTime || '30'} minutes à préparer.

${recipe.description ? `📝 ${recipe.description}` : ''}

Les ingrédients principaux incluent : ${recipe.ingredients?.slice(0, 3).map(ing => ing.name).join(', ') || 'des ingrédients délicieux'}.

💡 Petite astuce : Cette recette est idéale pour un repas en famille et peut facilement être adaptée selon vos goûts !

📎 Vous trouverez la recette complète en pièce jointe au format PDF.

J'espère que vous prendrez plaisir à la cuisiner ensemble ! 👨‍🍳👩‍🍳

Bon appétit ! 🍽️

---
Partagé via MiamBidi
Application de planification de repas familiale 💚`;
};

/**
 * Share recipe via email with PDF attachment
 * @param {Object} recipe - Recipe object
 * @param {Array} emailAddresses - Array of email addresses
 * @param {Object} familyData - Family information
 * @param {Blob} pdfBlob - PDF blob for attachment (optional)
 * @returns {Promise<Object>} - Sharing result
 */
export const shareRecipeViaEmail = async (recipe, emailAddresses = [], familyData = null, pdfBlob = null) => {
  if (!recipe) {
    return {
      success: false,
      message: 'Aucune recette à partager'
    };
  }

  if (emailAddresses.length === 0) {
    return {
      success: false,
      message: 'Aucune adresse email fournie'
    };
  }

  try {
    // Generate AI-enhanced email content
    const emailContent = await generateRecipeEmailContent(recipe, familyData);
    
    // Prepare email data
    const subject = encodeURIComponent(`Recette: ${recipe.name || 'Délicieuse recette'} - MiamBidi`);
    const body = encodeURIComponent(emailContent);
    const recipients = emailAddresses.join(',');

    // Create mailto link
    const mailtoLink = `mailto:${recipients}?subject=${subject}&body=${body}`;

    // Check if mailto link is too long
    if (mailtoLink.length > 2000) {
      return {
        success: false,
        message: 'Le contenu de l\'email est trop long. Essayez avec moins de destinataires ou téléchargez le PDF manuellement.'
      };
    }

    // Open email client
    window.location.href = mailtoLink;

    return {
      success: true,
      message: `Email préparé pour ${emailAddresses.length} destinataire(s). ${pdfBlob ? 'N\'oubliez pas d\'attacher le PDF téléchargé.' : ''}`,
      emailContent
    };

  } catch (error) {
    console.error('Error sharing recipe via email:', error);
    return {
      success: false,
      message: `Erreur lors du partage: ${error.message}`
    };
  }
};

/**
 * Share recipe with automatic PDF generation and email
 * @param {Object} recipe - Recipe object
 * @param {Array} emailAddresses - Array of email addresses
 * @param {Object} familyData - Family information
 * @returns {Promise<Object>} - Sharing result with steps
 */
export const shareRecipeWithPDF = async (recipe, emailAddresses = [], familyData = null) => {
  const result = {
    success: false,
    message: '',
    steps: {
      pdfGeneration: { status: 'pending', message: '' },
      emailGeneration: { status: 'pending', message: '' },
      emailSending: { status: 'pending', message: '' }
    }
  };

  try {
    // Import PDF service dynamically to avoid circular dependencies
    const { generateRecipePDF, downloadRecipePDF } = await import('./pdfService.js');

    // Step 1: Generate PDF
    result.steps.pdfGeneration.status = 'loading';
    const pdfResult = await generateRecipePDF(recipe);
    
    if (!pdfResult.success) {
      result.steps.pdfGeneration.status = 'error';
      result.steps.pdfGeneration.message = 'Échec de la génération PDF';
      result.message = 'Erreur lors de la génération du PDF';
      return result;
    }

    result.steps.pdfGeneration.status = 'success';
    result.steps.pdfGeneration.message = 'PDF généré avec succès';

    // Step 2: Download PDF
    const downloadResult = downloadRecipePDF(pdfResult);
    if (!downloadResult.success) {
      result.steps.pdfGeneration.status = 'error';
      result.steps.pdfGeneration.message = 'Échec du téléchargement PDF';
    }

    // Step 3: Generate and send email
    result.steps.emailGeneration.status = 'loading';
    const emailResult = await shareRecipeViaEmail(recipe, emailAddresses, familyData);
    
    if (emailResult.success) {
      result.steps.emailGeneration.status = 'success';
      result.steps.emailGeneration.message = 'Email généré avec succès';
      result.steps.emailSending.status = 'success';
      result.steps.emailSending.message = 'Client email ouvert';
      
      result.success = true;
      result.message = `Recette partagée avec succès ! PDF téléchargé: "${pdfResult.filename}". N'oubliez pas de l'attacher à votre email.`;
    } else {
      result.steps.emailGeneration.status = 'error';
      result.steps.emailGeneration.message = emailResult.message;
      result.message = `PDF généré mais erreur email: ${emailResult.message}`;
    }

    return result;

  } catch (error) {
    console.error('Error in shareRecipeWithPDF:', error);
    result.message = `Erreur lors du partage: ${error.message}`;
    return result;
  }
};

/**
 * Validate email addresses
 * @param {Array} emails - Array of email addresses
 * @returns {Object} - Validation result
 */
export const validateEmailAddresses = (emails) => {
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
};

export default {
  generateRecipeEmailContent,
  shareRecipeViaEmail,
  shareRecipeWithPDF,
  validateEmailAddresses
};
