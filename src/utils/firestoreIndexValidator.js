/**
 * Firestore Index Validation Utility
 * Checks if required indexes are available and provides helpful feedback
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';

// Index validation results
export const INDEX_STATUS = {
  AVAILABLE: 'available',
  MISSING: 'missing',
  ERROR: 'error',
  UNKNOWN: 'unknown'
};

/**
 * Test if a specific index is available
 * @param {string} collectionName - Firestore collection name
 * @param {Array} whereConditions - Array of where conditions
 * @param {Array} orderByFields - Array of orderBy fields
 * @returns {Promise<Object>} Index status and details
 */
const testIndex = async (collectionName, whereConditions = [], orderByFields = []) => {
  try {
    let q = collection(db, collectionName);

    // Add where conditions
    whereConditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });

    // Add orderBy fields
    orderByFields.forEach(field => {
      q = query(q, orderBy(field.field, field.direction));
    });

    // Add limit to minimize data transfer
    q = query(q, limit(1));

    // Execute query
    await getDocs(q);
    
    return {
      status: INDEX_STATUS.AVAILABLE,
      message: 'Index disponible',
      collection: collectionName,
      conditions: whereConditions,
      orderBy: orderByFields
    };

  } catch (error) {
    if (error.code === 'failed-precondition') {
      return {
        status: INDEX_STATUS.MISSING,
        message: 'Index manquant - création requise',
        collection: collectionName,
        conditions: whereConditions,
        orderBy: orderByFields,
        error: error.message,
        createUrl: extractCreateUrl(error.message)
      };
    } else {
      return {
        status: INDEX_STATUS.ERROR,
        message: `Erreur lors du test: ${error.message}`,
        collection: collectionName,
        conditions: whereConditions,
        orderBy: orderByFields,
        error: error.message
      };
    }
  }
};

/**
 * Extract Firebase Console URL for creating missing index
 * @param {string} errorMessage - Firebase error message
 * @returns {string|null} URL to create index or null
 */
const extractCreateUrl = (errorMessage) => {
  const urlMatch = errorMessage.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
  return urlMatch ? urlMatch[1] : null;
};

/**
 * Validate all blog-related indexes
 * @returns {Promise<Object>} Validation results for all blog indexes
 */
export const validateBlogIndexes = async () => {
  const results = {
    overall: INDEX_STATUS.UNKNOWN,
    indexes: [],
    summary: {
      available: 0,
      missing: 0,
      errors: 0
    },
    recommendations: []
  };

  // Test cases for blog indexes
  const indexTests = [
    {
      name: 'User Blogs Query',
      description: 'Requête pour les articles d\'un utilisateur',
      collection: 'blogs',
      whereConditions: [
        { field: 'authorId', operator: '==', value: 'test-user-id' }
      ],
      orderByFields: [
        { field: 'updatedAt', direction: 'desc' }
      ]
    },
    {
      name: 'Public Blogs Query',
      description: 'Requête pour les articles publics',
      collection: 'blogs',
      whereConditions: [
        { field: 'status', operator: '==', value: 'published' },
        { field: 'visibility', operator: '==', value: 'public' }
      ],
      orderByFields: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      name: 'Author + Status Query',
      description: 'Requête pour les articles par auteur et statut',
      collection: 'blogs',
      whereConditions: [
        { field: 'authorId', operator: '==', value: 'test-user-id' },
        { field: 'status', operator: '==', value: 'published' }
      ],
      orderByFields: [
        { field: 'updatedAt', direction: 'desc' }
      ]
    },
    {
      name: 'Family Blogs Query',
      description: 'Requête pour les articles de famille',
      collection: 'blogs',
      whereConditions: [
        { field: 'familyId', operator: '==', value: 'test-family-id' },
        { field: 'status', operator: '==', value: 'published' }
      ],
      orderByFields: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      name: 'Visibility Query',
      description: 'Requête par visibilité',
      collection: 'blogs',
      whereConditions: [
        { field: 'visibility', operator: '==', value: 'public' }
      ],
      orderByFields: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    }
  ];

  // Test each index
  for (const test of indexTests) {
    const result = await testIndex(
      test.collection,
      test.whereConditions,
      test.orderByFields
    );

    results.indexes.push({
      ...result,
      name: test.name,
      description: test.description
    });

    // Update summary
    switch (result.status) {
      case INDEX_STATUS.AVAILABLE:
        results.summary.available++;
        break;
      case INDEX_STATUS.MISSING:
        results.summary.missing++;
        break;
      case INDEX_STATUS.ERROR:
        results.summary.errors++;
        break;
    }
  }

  // Determine overall status
  if (results.summary.missing > 0) {
    results.overall = INDEX_STATUS.MISSING;
  } else if (results.summary.errors > 0) {
    results.overall = INDEX_STATUS.ERROR;
  } else if (results.summary.available > 0) {
    results.overall = INDEX_STATUS.AVAILABLE;
  }

  // Generate recommendations
  if (results.summary.missing > 0) {
    results.recommendations.push({
      type: 'critical',
      message: `${results.summary.missing} index(es) manquant(s). La fonctionnalité blog sera limitée.`,
      action: 'Créer les index manquants via Firebase Console'
    });
  }

  if (results.summary.errors > 0) {
    results.recommendations.push({
      type: 'warning',
      message: `${results.summary.errors} erreur(s) lors de la validation des index.`,
      action: 'Vérifier la configuration Firestore et les permissions'
    });
  }

  if (results.summary.available === indexTests.length) {
    results.recommendations.push({
      type: 'success',
      message: 'Tous les index blog sont disponibles. Fonctionnalité complète.',
      action: 'Aucune action requise'
    });
  }

  return results;
};

/**
 * Validate essential app indexes (ingredients, pantry, etc.)
 * @returns {Promise<Object>} Validation results for core app indexes
 */
export const validateCoreIndexes = async () => {
  const results = {
    overall: INDEX_STATUS.UNKNOWN,
    indexes: [],
    summary: {
      available: 0,
      missing: 0,
      errors: 0
    }
  };

  const coreIndexTests = [
    {
      name: 'Ingredients by Family',
      collection: 'ingredients',
      whereConditions: [
        { field: 'familyId', operator: '==', value: 'test-family-id' }
      ],
      orderByFields: [
        { field: 'name', direction: 'asc' }
      ]
    },
    {
      name: 'Public Ingredients',
      collection: 'ingredients',
      whereConditions: [
        { field: 'isPublic', operator: '==', value: true }
      ],
      orderByFields: [
        { field: 'name', direction: 'asc' }
      ]
    },
    {
      name: 'Pantry by Family',
      collection: 'pantry',
      whereConditions: [
        { field: 'familyId', operator: '==', value: 'test-family-id' }
      ],
      orderByFields: [
        { field: 'ingredientName', direction: 'asc' }
      ]
    }
  ];

  // Test each core index
  for (const test of coreIndexTests) {
    const result = await testIndex(
      test.collection,
      test.whereConditions,
      test.orderByFields
    );

    results.indexes.push({
      ...result,
      name: test.name
    });

    // Update summary
    switch (result.status) {
      case INDEX_STATUS.AVAILABLE:
        results.summary.available++;
        break;
      case INDEX_STATUS.MISSING:
        results.summary.missing++;
        break;
      case INDEX_STATUS.ERROR:
        results.summary.errors++;
        break;
    }
  }

  // Determine overall status
  if (results.summary.missing > 0) {
    results.overall = INDEX_STATUS.MISSING;
  } else if (results.summary.errors > 0) {
    results.overall = INDEX_STATUS.ERROR;
  } else if (results.summary.available > 0) {
    results.overall = INDEX_STATUS.AVAILABLE;
  }

  return results;
};

/**
 * Generate user-friendly status report
 * @param {Object} validationResults - Results from validateBlogIndexes or validateCoreIndexes
 * @returns {string} Formatted status report
 */
export const generateStatusReport = (validationResults) => {
  const { overall, summary, recommendations } = validationResults;
  
  let report = `📊 État des Index Firestore\n\n`;
  report += `✅ Disponibles: ${summary.available}\n`;
  report += `❌ Manquants: ${summary.missing}\n`;
  report += `⚠️ Erreurs: ${summary.errors}\n\n`;

  if (recommendations.length > 0) {
    report += `📋 Recommandations:\n`;
    recommendations.forEach((rec, index) => {
      const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : '✅';
      report += `${index + 1}. ${icon} ${rec.message}\n   Action: ${rec.action}\n\n`;
    });
  }

  return report;
};

export default {
  validateBlogIndexes,
  validateCoreIndexes,
  generateStatusReport,
  INDEX_STATUS
};
