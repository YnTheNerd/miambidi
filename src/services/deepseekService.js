/**
 * OpenRouter AI Service for Recipe Generation (using DeepSeek models)
 *
 * IMPORTANT: Replace 'YOUR_OPENROUTER_API_KEY_HERE' with your actual OpenRouter API key
 * Get your API key from: https://openrouter.ai/keys
 *
 * This service uses OpenRouter as the API provider to access DeepSeek models
 * for recipe generation with a focus on Cameroonian and African cuisine.
 */

const OPENROUTER_API_KEY = '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'; // ✅ YOUR OPENROUTER API KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek/deepseek-r1-0528:free'; // Free DeepSeek model via OpenRouter

// Optional: Add your site information for OpenRouter rankings
const SITE_URL = 'http://localhost:5174'; // Replace with your actual site URL if deployed
const SITE_NAME = 'MiamBidi'; // Your application name

/**
 * Generate a complete recipe using DeepSeek AI via OpenRouter with enhanced context
 * @param {string} recipeName - The name of the recipe to generate
 * @param {Array} availableIngredients - List of available ingredients from the database
 * @param {Object} context - Additional context for recipe generation
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} Generated recipe data
 */
export const generateRecipeWithDeepSeek = async (recipeName, availableIngredients = [], context = {}, maxRetries = 3) => {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE') {
    throw new Error('Clé API OpenRouter non configurée. Veuillez configurer votre clé API dans src/services/deepseekService.js');
  }

  if (!recipeName || recipeName.trim().length < 3) {
    throw new Error('Le nom de la recette doit contenir au moins 3 caractères');
  }

  let lastError = null;

  // Retry mechanism for better reliability
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentative ${attempt}/${maxRetries} pour générer la recette: ${recipeName}`);
      return await generateRecipeAttempt(recipeName, availableIngredients, context, attempt);
    } catch (error) {
      lastError = error;
      console.warn(`Tentative ${attempt} échouée:`, error.message);

      // Don't retry for certain types of errors
      if (error.message.includes('Clé API') ||
          error.message.includes('connexion') ||
          error.message.includes('401') ||
          error.message.includes('403')) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Attente de ${delay}ms avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed - provide fallback recipe
  console.warn(`Toutes les tentatives ont échoué, génération d'une recette de base pour: ${recipeName}. Dernière erreur:`, lastError?.message);
  return generateFallbackRecipe(recipeName, availableIngredients, context);
};

/**
 * Generate a basic fallback recipe when AI fails
 * @param {string} recipeName - The name of the recipe
 * @param {Array} availableIngredients - Available ingredients
 * @param {Object} context - Recipe generation context
 * @returns {Object} Basic recipe structure
 */
const generateFallbackRecipe = (recipeName, availableIngredients = [], context = {}) => {
  const {
    servings = 4,
    skillLevel = 'Moyen',
    cuisineStyle = 'camerounaise'
  } = context;
  // Use some available ingredients or common ones
  const baseIngredients = availableIngredients.length > 0
    ? availableIngredients.slice(0, 5).map(ing => ({
        name: ing.name,
        quantity: 200,
        unit: ing.unit || 'g',
        category: ing.category || 'Autres'
      }))
    : [
        { name: 'Huile de palme', quantity: 3, unit: 'cuillères à soupe', category: 'Huiles' },
        { name: 'Oignon', quantity: 1, unit: 'pièce', category: 'Légumes' },
        { name: 'Ail', quantity: 2, unit: 'gousses', category: 'Épices' },
        { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Épices' },
        { name: 'Poivre', quantity: 1, unit: 'pincée', category: 'Épices' }
      ];

  return {
    description: `Délicieuse recette de ${recipeName} préparée avec des ingrédients traditionnels ${cuisineStyle}s. Cette recette familiale saura ravir vos papilles avec ses saveurs authentiques.`,
    prepTime: 30,
    cookTime: 45,
    servings: servings,
    difficulty: skillLevel,
    cuisine: cuisineStyle,
    categories: ['Plat Principal', 'Traditionnel'],
    ingredients: baseIngredients,
    instructions: [
      'Préparez tous les ingrédients en les lavant et en les découpant selon les besoins.',
      'Faites chauffer l\'huile dans une grande casserole à feu moyen.',
      'Ajoutez les oignons et l\'ail, faites revenir jusqu\'à ce qu\'ils soient dorés.',
      'Incorporez les autres ingrédients un par un en mélangeant bien.',
      'Laissez mijoter à feu doux pendant 30-40 minutes en remuant occasionnellement.',
      'Goûtez et ajustez l\'assaisonnement selon vos préférences.',
      'Servez chaud accompagné de riz, plantain ou igname.'
    ],
    tips: [
      'Vous pouvez adapter cette recette selon vos goûts et les ingrédients disponibles.',
      'Pour plus de saveur, laissez mariner les ingrédients principaux avant la cuisson.',
      'Cette recette se conserve bien au réfrigérateur pendant 2-3 jours.'
    ],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 25,
      fat: 15,
      fiber: 6
    },
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
    generatedBy: 'MiamBidi Fallback Generator',
    isFallback: true
  };
};

/**
 * Single attempt to generate a recipe
 * @param {string} recipeName - The name of the recipe to generate
 * @param {Array} availableIngredients - List of available ingredients from the database
 * @param {Object} context - Additional context for recipe generation
 * @param {number} attemptNumber - Current attempt number for logging
 * @returns {Promise<Object>} Generated recipe data
 */
const generateRecipeAttempt = async (recipeName, availableIngredients = [], context = {}, attemptNumber = 1) => {

  // Extract context information
  const {
    dietaryPreferences = [],
    cookingEquipment = [],
    skillLevel = 'Moyen',
    servings = 4,
    maxPrepTime = null,
    cuisineStyle = 'camerounaise',
    cookingMethod = null,
    familySize = null,
    allergies = []
  } = context;

  // Create ingredient list for AI context
  const ingredientList = availableIngredients.length > 0
    ? availableIngredients.map(ing => `${ing.name} (${ing.unit})`).join(', ')
    : 'Utilisez des ingrédients typiques de la cuisine camerounaise et africaine';

  // Build enhanced context prompt
  let contextPrompt = `Génère une recette complète en français pour "${recipeName}".

CONTEXTE SPÉCIFIQUE:
- Cuisine: ${cuisineStyle} (focus sur l'authenticité camerounaise/africaine)
- Niveau de compétence: ${skillLevel}
- Portions: ${servings} personnes${familySize ? ` (famille de ${familySize})` : ''}
- Ingrédients disponibles: ${ingredientList}`;

  if (maxPrepTime) {
    contextPrompt += `\n- Temps maximum souhaité: ${maxPrepTime} minutes`;
  }

  if (cookingMethod) {
    contextPrompt += `\n- Méthode de cuisson préférée: ${cookingMethod}`;
  }

  if (cookingEquipment.length > 0) {
    contextPrompt += `\n- Équipement disponible: ${cookingEquipment.join(', ')}`;
  }

  if (dietaryPreferences.length > 0) {
    contextPrompt += `\n- Préférences alimentaires: ${dietaryPreferences.join(', ')}`;
  }

  if (allergies.length > 0) {
    contextPrompt += `\n- Allergies à éviter: ${allergies.join(', ')}`;
  }

  const prompt = `${contextPrompt}

INSTRUCTIONS TECHNIQUES CAMEROUNAISES:
- Utilise des techniques de cuisson traditionnelles (mijoter, braiser, cuire à l'étouffée)
- Inclus des épices et condiments authentiques (piment, gingembre, ail, oignon, cube Maggi, huile de palme)
- Respecte les associations d'ingrédients typiques de la cuisine camerounaise
- Propose des accompagnements traditionnels (riz, plantain, igname, macabo, etc.)

EXEMPLES D'INSTRUCTIONS BIEN STRUCTURÉES:
"Étape 1: Préparez tous les ingrédients en lavant soigneusement les légumes et en découpant la viande en morceaux de 3-4 cm."
"Étape 2: Dans une grande casserole, faites chauffer 3 cuillères à soupe d'huile de palme à feu moyen pendant 2 minutes."
"Étape 3: Ajoutez les oignons émincés et faites-les revenir pendant 5 minutes jusqu'à ce qu'ils deviennent translucides."

Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact:
{
  "description": "Description appétissante de la recette qui mentionne '${recipeName}' et ses caractéristiques principales",
  "prepTime": 30,
  "cookTime": 45,
  "servings": ${servings},
  "difficulty": "${skillLevel}",
  "cuisine": "${cuisineStyle}",
  "categories": ["Plat Principal", "Traditionnel"],
  "ingredients": [
    {
      "name": "Nom de l'ingrédient camerounais authentique",
      "quantity": 500,
      "unit": "g",
      "category": "Légumes"
    }
  ],
  "instructions": [
    "Étape 1: Description détaillée avec temps et techniques spécifiques (ex: 'Faites chauffer pendant 5 minutes')",
    "Étape 2: Instructions précises avec quantités et méthodes camerounaises",
    "Étape 3: Étapes de finalisation avec conseils de présentation"
  ],
  "tips": [
    "Conseil authentique pour réussir cette recette camerounaise",
    "Astuce sur les ingrédients ou techniques traditionnelles"
  ],
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 40,
    "fat": 12,
    "fiber": 8
  }
}

VALIDATION OBLIGATOIRE:
- La recette DOIT correspondre exactement à "${recipeName}"
- Les instructions DOIVENT être détaillées (minimum 4 étapes de 15+ mots chacune)
- Les ingrédients DOIVENT inclure des éléments camerounais authentiques
- Les quantités DOIVENT être réalistes pour ${servings} personnes
- La difficulté DOIT correspondre au niveau "${skillLevel}"
- Les temps de préparation DOIVENT être cohérents avec la complexité${maxPrepTime ? ` (maximum ${maxPrepTime} minutes total)` : ''}
- Les instructions DOIVENT utiliser des techniques de cuisson camerounaises appropriées`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL, // Optional: for OpenRouter rankings
        'X-Title': SITE_NAME // Optional: for OpenRouter rankings
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Tu es un chef expert en cuisine camerounaise et africaine. Tu génères des recettes authentiques et détaillées en français. RÈGLE ABSOLUE: Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte supplémentaire avant ou après. Pas de commentaires, pas d\'explications, juste le JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur API OpenRouter: ${response.status} - ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse API invalide: structure de données manquante');
    }

    const content = data.choices[0].message.content.trim();

    // Enhanced JSON extraction with multiple fallback strategies
    let generatedRecipe;
    let parseError = null;

    // Strategy 1: Try to find complete JSON object
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        generatedRecipe = JSON.parse(jsonMatch[0]);
      } catch (error) {
        parseError = error;
        console.warn('Strategy 1 failed:', error.message);
      }
    }

    // Strategy 2: Try to extract JSON between code blocks
    if (!generatedRecipe) {
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
      if (codeBlockMatch) {
        try {
          generatedRecipe = JSON.parse(codeBlockMatch[1]);
          parseError = null;
        } catch (error) {
          parseError = error;
          console.warn('Strategy 2 failed:', error.message);
        }
      }
    }

    // Strategy 3: Try to clean and parse the entire content
    if (!generatedRecipe) {
      try {
        // Remove common prefixes and suffixes that might interfere
        let cleanContent = content
          .replace(/^[^{]*/, '') // Remove everything before first {
          .replace(/[^}]*$/, '') // Remove everything after last }
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        if (cleanContent.startsWith('{') && cleanContent.endsWith('}')) {
          generatedRecipe = JSON.parse(cleanContent);
          parseError = null;
        }
      } catch (error) {
        parseError = error;
        console.warn('Strategy 3 failed:', error.message);
      }
    }

    // Strategy 4: Try to fix common JSON issues
    if (!generatedRecipe && jsonMatch) {
      try {
        let fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/\n/g, ' ') // Remove newlines that might break parsing
          .replace(/\t/g, ' '); // Replace tabs with spaces

        generatedRecipe = JSON.parse(fixedJson);
        parseError = null;
      } catch (error) {
        parseError = error;
        console.warn('Strategy 4 failed:', error.message);
      }
    }

    if (!generatedRecipe) {
      console.error('All parsing strategies failed. Raw content:', content);
      throw new Error(`Erreur de format dans la réponse de l'IA. ${parseError ? parseError.message : 'Format JSON invalide'}`);
    }
    
    // Validate required fields
    const requiredFields = ['description', 'prepTime', 'cookTime', 'servings', 'difficulty', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!generatedRecipe[field]) {
        throw new Error(`Champ requis manquant dans la recette générée: ${field}`);
      }
    }

    // Validate ingredients array
    if (!Array.isArray(generatedRecipe.ingredients) || generatedRecipe.ingredients.length === 0) {
      throw new Error('La liste des ingrédients est invalide ou vide');
    }

    // Validate instructions array
    if (!Array.isArray(generatedRecipe.instructions) || generatedRecipe.instructions.length === 0) {
      throw new Error('La liste des instructions est invalide ou vide');
    }

    // Validate recipe name relevance
    const recipeNameLower = recipeName.toLowerCase();
    const descriptionLower = generatedRecipe.description.toLowerCase();
    const instructionsText = generatedRecipe.instructions.join(' ').toLowerCase();

    // Check if the recipe content is relevant to the requested name
    const nameWords = recipeNameLower.split(' ').filter(word => word.length > 2);
    const hasRelevantContent = nameWords.some(word =>
      descriptionLower.includes(word) || instructionsText.includes(word)
    );

    if (!hasRelevantContent && attemptNumber === 1) {
      console.warn(`Generated recipe may not match "${recipeName}". Retrying with more specific prompt.`);
      throw new Error('La recette générée ne correspond pas au nom demandé');
    }

    // Ensure all ingredients have required fields
    generatedRecipe.ingredients = generatedRecipe.ingredients.map(ingredient => ({
      name: ingredient.name || 'Ingrédient inconnu',
      quantity: parseFloat(ingredient.quantity) || 1,
      unit: ingredient.unit || 'unité',
      category: ingredient.category || 'Autres'
    }));

    // Ensure numeric fields are numbers
    generatedRecipe.prepTime = parseInt(generatedRecipe.prepTime) || 30;
    generatedRecipe.cookTime = parseInt(generatedRecipe.cookTime) || 45;
    generatedRecipe.servings = parseInt(generatedRecipe.servings) || 4;

    // Set default values for optional fields
    generatedRecipe.cuisine = generatedRecipe.cuisine || 'camerounaise';
    generatedRecipe.categories = Array.isArray(generatedRecipe.categories) ? generatedRecipe.categories : ['Plat Principal'];
    generatedRecipe.tips = Array.isArray(generatedRecipe.tips) ? generatedRecipe.tips : [];
    
    // Ensure nutrition object exists
    if (!generatedRecipe.nutrition || typeof generatedRecipe.nutrition !== 'object') {
      generatedRecipe.nutrition = {
        calories: 300,
        protein: 20,
        carbs: 35,
        fat: 10,
        fiber: 5
      };
    }

    // Add metadata
    generatedRecipe.aiGenerated = true;
    generatedRecipe.generatedAt = new Date().toISOString();
    generatedRecipe.generatedBy = 'DeepSeek AI via OpenRouter';

    return generatedRecipe;

  } catch (error) {
    console.error('OpenRouter API Error:', error);

    // Provide specific error messages
    if (error.message.includes('fetch')) {
      throw new Error('Erreur de connexion à l\'API OpenRouter. Vérifiez votre connexion internet.');
    }

    if (error.message.includes('401') || error.message.includes('403')) {
      throw new Error('Clé API OpenRouter invalide. Vérifiez votre clé API.');
    }

    if (error.message.includes('429')) {
      throw new Error('Limite de taux API atteinte. Veuillez réessayer dans quelques minutes.');
    }

    if (error.message.includes('JSON')) {
      throw new Error('Erreur de format dans la réponse de l\'IA. Veuillez réessayer.');
    }

    // Re-throw the error with original message if it's already user-friendly
    throw error;
  }
};

/**
 * Test the OpenRouter API connection
 * @returns {Promise<boolean>} True if API is working
 */
export const testDeepSeekConnection = async () => {
  try {
    await generateRecipeWithDeepSeek('Test de connexion', []);
    return true;
  } catch (error) {
    console.error('OpenRouter connection test failed:', error);
    return false;
  }
};

/**
 * Get API key status
 * @returns {Object} API key configuration status
 */
export const getApiKeyStatus = () => {
  return {
    configured: OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'YOUR_OPENROUTER_API_KEY_HERE',
    placeholder: OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE'
  };
};

/**
 * Generate chatbot response using DeepSeek AI
 * @param {string} userMessage - User's message
 * @param {Object} context - Application context data
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} - AI response
 */
export const generateChatbotResponse = async (userMessage, context = {}, conversationHistory = []) => {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE') {
    throw new Error('Clé API OpenRouter non configurée');
  }

  if (!userMessage || userMessage.trim().length < 1) {
    throw new Error('Message utilisateur requis');
  }

  try {
    // Build context information for the AI
    const contextInfo = buildContextPrompt(context);

    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: `Tu es l'Assistant Culinaire MiamBidi, un expert en cuisine camerounaise et africaine qui aide les familles avec leur planification de repas. Tu as accès aux données en temps réel de l'application.

PERSONNALITÉ:
- Chaleureux, familial et bienveillant
- Expert en cuisine camerounaise/africaine
- Utilise des expressions françaises et camerounaises
- Toujours positif et encourageant
- Réponds principalement en français

CAPACITÉS:
- Accès aux données du garde-manger, recettes, et famille
- Recommandations basées sur les ingrédients disponibles
- Conseils de cuisine traditionnelle camerounaise
- Aide navigation dans l'application
- Planification de repas optimisée

DONNÉES ACTUELLES:
${contextInfo}

INSTRUCTIONS SPÉCIALES:
- Si tu ne peux pas répondre directement, utilise l'humour camerounais
- Références à Samuel Eto'o (2/5 fois), humour robot/IA (2/5 fois), observations quotidiennes (1/5 fois)
- Maximum 4 phrases pour les réponses d'erreur
- Toujours inclure des emojis appropriés
- Reste dans le contexte culinaire et familial`
      }
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messages,
        max_tokens: 800,
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

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Chatbot API Error:', error);

    // Return humorous fallback response
    return generateHumorousFallback(userMessage);
  }
};

/**
 * Build context prompt from application data
 * @param {Object} context - Application context
 * @returns {string} - Formatted context information
 */
const buildContextPrompt = (context) => {
  const {
    pantryStats = {},
    recipeStats = {},
    familyInfo = {},
    pantryItems = [],
    recentRecipes = []
  } = context;

  let contextInfo = '';

  // Family information
  if (familyInfo.name) {
    contextInfo += `Famille: ${familyInfo.name} (${familyInfo.memberCount || 0} membres)\n`;
  }

  // Pantry information
  if (pantryStats.totalItems !== undefined) {
    contextInfo += `Garde-manger: ${pantryStats.totalItems} ingrédients`;
    if (pantryStats.expiringCount > 0) {
      contextInfo += `, ${pantryStats.expiringCount} expirent bientôt`;
    }
    if (pantryStats.expiredCount > 0) {
      contextInfo += `, ${pantryStats.expiredCount} expirés`;
    }
    contextInfo += '\n';
  }

  // Recent pantry items
  if (pantryItems.length > 0) {
    const recentItems = pantryItems.slice(0, 10).map(item => item.ingredientName).join(', ');
    contextInfo += `Ingrédients récents: ${recentItems}\n`;
  }

  // Recipe information
  if (recipeStats.totalRecipes !== undefined) {
    contextInfo += `Recettes: ${recipeStats.totalRecipes} total`;
    if (recipeStats.familyRecipes !== undefined) {
      contextInfo += `, ${recipeStats.familyRecipes} familiales`;
    }
    if (recipeStats.favoriteCount !== undefined) {
      contextInfo += `, ${recipeStats.favoriteCount} favorites`;
    }
    contextInfo += '\n';
  }

  return contextInfo || 'Aucune donnée contextuelle disponible';
};

/**
 * Generate humorous fallback response
 * @param {string} userMessage - Original user message
 * @returns {string} - Humorous fallback response
 */
const generateHumorousFallback = (userMessage) => {
  const fallbackPatterns = [
    // Samuel Eto'o references (2/5)
    "Je ne trouve pas cette information dans mes circuits... 🤖 Comme dirait Samuel Eto'o, parfois il faut passer le ballon ! ⚽ Essayez de reformuler votre question ou demandez-moi autre chose ! 😄",
    "Mes données sont un peu embrouillées là... 😅 Samuel Eto'o aussi a raté des buts, mais il a continué à jouer ! ⚽ Reformulez votre question et on va marquer ensemble ! 🍽️",

    // AI/Robot humor (2/5)
    "Je ne trouve pas cette information dans mes circuits... 🤖 Mes circuits ont besoin d'un café camerounais pour mieux fonctionner ! ☕ Essayez de reformuler votre question ou demandez-moi autre chose ! 😄",
    "Erreur 404: réponse non trouvée dans ma base de données culinaire ! 🤖 Même les robots ont parfois besoin d'une pause ndolé ! 🍽️ Reformulez votre question s'il vous plaît ! 😊",

    // Daily life observations (1/5)
    "Je ne trouve pas cette information dans mes circuits... 😅 C'est comme chercher du sel dans un plat de ndolé déjà salé ! 🍽️ Essayez de reformuler votre question ou demandez-moi autre chose ! 💚"
  ];

  // Rotate through patterns based on current time
  const patternIndex = Math.floor(Date.now() / 10000) % fallbackPatterns.length;
  return fallbackPatterns[patternIndex];
};

export default {
  generateRecipeWithDeepSeek,
  generateChatbotResponse,
  testDeepSeekConnection,
  getApiKeyStatus
};
