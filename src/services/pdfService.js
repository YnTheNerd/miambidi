/**
 * PDF Generation Service for MiamBidi
 * Handles PDF creation for recipes with proper French formatting
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a PDF for a recipe
 * @param {Object} recipe - Recipe object
 * @param {Object} options - PDF generation options
 * @returns {Promise<Object>} - Result object with success status and data
 */
export const generateRecipePDF = async (recipe, options = {}) => {
  if (!recipe) {
    throw new Error('Recette non fournie pour la génération PDF');
  }

  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up fonts and colors
    pdf.setFont('helvetica');
    const primaryColor = [46, 125, 50]; // MiamBidi green
    const textColor = [33, 33, 33];
    const lightGray = [128, 128, 128];

    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header with MiamBidi branding
    pdf.setFontSize(12);
    pdf.setTextColor(...lightGray);
    pdf.text('MiamBidi - Planification de Repas Familiale', margin, yPosition);
    yPosition += 15;

    // Recipe title
    pdf.setFontSize(24);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(recipe.name || 'Recette Sans Nom', contentWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 8 + 10;

    // Recipe image placeholder (if available)
    if (recipe.imageUrl) {
      try {
        // Add image placeholder text for now
        pdf.setFontSize(10);
        pdf.setTextColor(...lightGray);
        pdf.text('📷 Image de la recette disponible', margin, yPosition);
        yPosition += 15;
      } catch (error) {
        console.warn('Could not add recipe image to PDF:', error);
      }
    }

    // Recipe metadata
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(...textColor);

    const metadata = [];
    if (recipe.prepTime) metadata.push(`⏱️ Préparation: ${recipe.prepTime} min`);
    if (recipe.cookTime) metadata.push(`🔥 Cuisson: ${recipe.cookTime} min`);
    if (recipe.servings) metadata.push(`👥 Portions: ${recipe.servings}`);
    if (recipe.difficulty) metadata.push(`📊 Difficulté: ${recipe.difficulty}`);
    if (recipe.cuisine) metadata.push(`🌍 Cuisine: ${recipe.cuisine}`);

    metadata.forEach(item => {
      pdf.text(item, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Description
    if (recipe.description) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.text('Description', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(...textColor);
      const descLines = pdf.splitTextToSize(recipe.description, contentWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 15;
    }

    // Ingredients section
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(...primaryColor);
      pdf.text('🥘 Ingrédients', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(...textColor);

      recipe.ingredients.forEach((ingredient, index) => {
        const ingredientText = `• ${ingredient.quantity || ''} ${ingredient.unit || ''} ${ingredient.name || ''}`.trim();
        const lines = pdf.splitTextToSize(ingredientText, contentWidth - 10);
        
        // Check if we need a new page
        if (yPosition + (lines.length * 5) > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 10;
    }

    // Instructions section
    if (recipe.instructions && recipe.instructions.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(...primaryColor);
      pdf.text('👨‍🍳 Instructions', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(...textColor);

      recipe.instructions.forEach((instruction, index) => {
        const stepText = `${index + 1}. ${instruction}`;
        const lines = pdf.splitTextToSize(stepText, contentWidth - 10);
        
        // Check if we need a new page
        if (yPosition + (lines.length * 5) > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 8;
      });
      yPosition += 10;
    }

    // Tips section
    if (recipe.tips && recipe.tips.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.text('💡 Conseils', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...textColor);

      recipe.tips.forEach((tip, index) => {
        const tipText = `• ${tip}`;
        const lines = pdf.splitTextToSize(tipText, contentWidth - 10);
        
        // Check if we need a new page
        if (yPosition + (lines.length * 4) > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 4 + 3;
      });
      yPosition += 10;
    }

    // Nutritional information
    if (recipe.nutrition && Object.values(recipe.nutrition).some(val => val > 0)) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.text('📊 Informations Nutritionnelles (par portion)', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...textColor);

      const nutritionInfo = [];
      if (recipe.nutrition.calories) nutritionInfo.push(`Calories: ${recipe.nutrition.calories} kcal`);
      if (recipe.nutrition.protein) nutritionInfo.push(`Protéines: ${recipe.nutrition.protein}g`);
      if (recipe.nutrition.carbs) nutritionInfo.push(`Glucides: ${recipe.nutrition.carbs}g`);
      if (recipe.nutrition.fat) nutritionInfo.push(`Lipides: ${recipe.nutrition.fat}g`);
      if (recipe.nutrition.fiber) nutritionInfo.push(`Fibres: ${recipe.nutrition.fiber}g`);

      nutritionInfo.forEach(info => {
        pdf.text(`• ${info}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.text('Généré par MiamBidi - Application de planification de repas familiale', margin, footerY);
    pdf.text(`Créé le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin - 50, footerY);

    // Generate filename
    const sanitizedName = (recipe.name || 'Recette')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const filename = `Recette de ${sanitizedName}.pdf`;

    return {
      success: true,
      pdf,
      filename,
      message: 'PDF généré avec succès'
    };

  } catch (error) {
    console.error('Error generating recipe PDF:', error);
    throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
  }
};

/**
 * Download a generated PDF
 * @param {Object} pdfResult - Result from generateRecipePDF
 * @returns {Object} - Download result
 */
export const downloadRecipePDF = (pdfResult) => {
  try {
    if (!pdfResult.success || !pdfResult.pdf) {
      throw new Error('PDF invalide pour le téléchargement');
    }

    // Download the PDF
    pdfResult.pdf.save(pdfResult.filename);

    return {
      success: true,
      message: `PDF "${pdfResult.filename}" téléchargé avec succès`,
      filename: pdfResult.filename
    };

  } catch (error) {
    console.error('Error downloading PDF:', error);
    return {
      success: false,
      message: `Erreur lors du téléchargement: ${error.message}`
    };
  }
};

/**
 * Generate PDF blob for email attachment
 * @param {Object} pdfResult - Result from generateRecipePDF
 * @returns {Blob} - PDF blob
 */
export const generatePDFBlob = (pdfResult) => {
  if (!pdfResult.success || !pdfResult.pdf) {
    throw new Error('PDF invalide pour la génération de blob');
  }

  return pdfResult.pdf.output('blob');
};

export default {
  generateRecipePDF,
  downloadRecipePDF,
  generatePDFBlob
};
