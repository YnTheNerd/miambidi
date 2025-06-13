/**
 * Enhanced Recipe Context for MiamBidi
 * Complete recipe management with real-time Firestore synchronization
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useFamily } from './FirestoreFamilyContext';
import { useNotification } from './NotificationContext';

const RecipeContext = createContext();

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
}

// Comprehensive recipe data for Camerounaise and African cuisine
const MOCK_RECIPES = [
  {
    id: 'recipe-1',
    name: 'Ndolé aux Crevettes',
    description: 'Plat traditionnel camerounais à base de feuilles de ndolé, crevettes et arachides',
    image: '/images/recipes/ndole.jpg',
    prepTime: 30,
    cookTime: 90,
    servings: 6,
    difficulty: 'Moyen',
    cuisine: 'camerounaise',
    categories: ['sauces traditionnelles', 'plats de tubercules'],
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: true,
      allergens: ['arachides', 'fruits de mer']
    },
    ingredients: [
      { name: 'Feuilles de ndolé', quantity: 500, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Crevettes séchées', quantity: 200, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Crevettes fraîches', quantity: 300, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Arachides crues', quantity: 250, unit: 'g', category: 'Céréales & Légumineuses' },
      { name: 'Viande de bœuf', quantity: 400, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Poisson fumé', quantity: 200, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Huile de palme', quantity: 4, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Oignons', quantity: 2, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 4, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Piment rouge', quantity: 2, unit: 'pièces', category: 'Épices & Piments' },
      { name: 'Cube Maggi', quantity: 2, unit: 'pièces', category: 'Huiles & Condiments' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' }
    ],
    instructions: [
      'Nettoyer et faire bouillir les feuilles de ndolé pendant 20 minutes, puis égoutter.',
      'Faire griller les arachides et les moudre finement.',
      'Couper la viande en morceaux et faire revenir dans l\'huile de palme.',
      'Ajouter les oignons, l\'ail et le gingembre hachés.',
      'Incorporer les crevettes séchées et le poisson fumé.',
      'Ajouter les arachides moulues et mélanger.',
      'Verser de l\'eau chaude pour couvrir et laisser mijoter 45 minutes.',
      'Ajouter les feuilles de ndolé et les crevettes fraîches.',
      'Assaisonner avec les cubes Maggi, le sel et le piment.',
      'Laisser cuire encore 15 minutes en remuant régulièrement.',
      'Servir chaud avec du riz blanc ou des tubercules.'
    ],
    tips: [
      'Les feuilles de ndolé peuvent être remplacées par des épinards si non disponibles.',
      'Ajuster la quantité de piment selon votre tolérance.',
      'Le plat est encore meilleur réchauffé le lendemain.'
    ],
    nutrition: {
      calories: 420,
      protein: 28,
      carbs: 15,
      fat: 30,
      fiber: 8
    },
    createdBy: 'mock-user-1',
    ownerId: 'mock-user-1',
    createdAt: '2025-01-15T10:00:00.000Z',
    familyId: 'mock-family-1',
    visibility: 'family',
    isPublic: false,
    public: false,
    rating: 4.8,
    reviews: 12,
    // Future AI Integration Fields
    aiGenerated: {
      isAiGenerated: false,
      generatedFrom: null, // 'meal-name', 'ingredients', 'dietary-preferences'
      aiConfidenceScore: null,
      lastAiUpdate: null
    },
    scalingInfo: {
      baseServings: 6,
      scalingFactors: {
        ingredients: 'linear', // 'linear', 'logarithmic', 'custom'
        cookingTime: 'logarithmic',
        prepTime: 'linear'
      }
    },
    aiEnhancements: {
      nutritionGenerated: false,
      tipsGenerated: false,
      difficultyCalculated: false,
      imageMatched: false
    }
  },
  {
    id: 'recipe-2',
    name: 'Eru aux Légumes',
    description: 'Soupe traditionnelle à base de feuilles d\'eru et légumes variés',
    image: '/images/recipes/eru.jpg',
    prepTime: 20,
    cookTime: 60,
    servings: 4,
    difficulty: 'Facile',
    cuisine: 'camerounaise',
    categories: ['sauces traditionnelles', 'soupes & bouillons'],
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: false,
      allergens: []
    },
    ingredients: [
      { name: 'Feuilles d\'eru', quantity: 400, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Épinards', quantity: 200, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Huile de palme', quantity: 3, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Oignons', quantity: 1, unit: 'pièce', category: 'Légumes-feuilles & Aromates' },
      { name: 'Tomates', quantity: 2, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 3, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Piment vert', quantity: 1, unit: 'pièce', category: 'Épices & Piments' },
      { name: 'Cube végétal', quantity: 1, unit: 'pièce', category: 'Huiles & Condiments' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' }
    ],
    instructions: [
      'Nettoyer soigneusement les feuilles d\'eru et les épinards.',
      'Hacher finement les oignons, l\'ail et le gingembre.',
      'Faire chauffer l\'huile de palme dans une casserole.',
      'Faire revenir les oignons jusqu\'à ce qu\'ils soient dorés.',
      'Ajouter l\'ail, le gingembre et les tomates coupées.',
      'Incorporer les feuilles d\'eru et mélanger.',
      'Verser de l\'eau chaude pour couvrir les légumes.',
      'Ajouter le cube végétal et laisser mijoter 30 minutes.',
      'Ajouter les épinards et le piment vert.',
      'Assaisonner avec le sel et cuire encore 10 minutes.',
      'Servir chaud avec du riz ou des tubercules.'
    ],
    tips: [
      'Les feuilles d\'eru peuvent être trouvées dans les épiceries africaines.',
      'Ajouter un peu de gingembre frais pour plus de saveur.',
      'Ce plat est parfait pour les végétariens.'
    ],
    nutrition: {
      calories: 180,
      protein: 8,
      carbs: 12,
      fat: 12,
      fiber: 6
    },
    createdBy: 'mock-user-2',
    ownerId: 'mock-user-2',
    createdAt: '2025-01-14T15:30:00.000Z',
    familyId: 'mock-family-1',
    visibility: 'private',
    isPublic: false,
    public: false,
    rating: 4.5,
    reviews: 8
  },
  {
    id: 'recipe-3',
    name: 'Poulet Braisé aux Épices',
    description: 'Poulet mariné et braisé avec des épices camerounaises traditionnelles',
    image: '/images/recipes/poulet-braise.jpg',
    prepTime: 45,
    cookTime: 60,
    servings: 4,
    difficulty: 'Moyen',
    cuisine: 'camerounaise',
    categories: ['grillades & braisés'],
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: false,
      allergens: []
    },
    ingredients: [
      { name: 'Poulet entier', quantity: 1, unit: 'pièce', category: 'Viandes & Poissons' },
      { name: 'Huile végétale', quantity: 4, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Oignons', quantity: 2, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Tomates', quantity: 3, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 6, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Piment rouge', quantity: 2, unit: 'pièces', category: 'Épices & Piments' },
      { name: 'Curry en poudre', quantity: 2, unit: 'cuillères à café', category: 'Épices & Piments' },
      { name: 'Thym', quantity: 1, unit: 'cuillère à café', category: 'Épices & Piments' },
      { name: 'Cube Maggi', quantity: 2, unit: 'pièces', category: 'Huiles & Condiments' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' },
      { name: 'Poivre noir', quantity: 1, unit: 'cuillère à café', category: 'Épices & Piments' }
    ],
    instructions: [
      'Découper le poulet en morceaux et nettoyer soigneusement.',
      'Préparer la marinade avec l\'ail, le gingembre, le curry, le thym, le sel et le poivre.',
      'Mariner le poulet pendant au moins 30 minutes.',
      'Faire chauffer l\'huile dans une grande casserole.',
      'Faire dorer les morceaux de poulet de tous les côtés.',
      'Retirer le poulet et faire revenir les oignons.',
      'Ajouter les tomates coupées et les piments.',
      'Remettre le poulet dans la casserole.',
      'Ajouter les cubes Maggi et un peu d\'eau.',
      'Couvrir et laisser braiser à feu doux pendant 45 minutes.',
      'Retourner les morceaux à mi-cuisson.',
      'Servir chaud avec du riz ou des plantains.'
    ],
    tips: [
      'Mariner le poulet plus longtemps pour plus de saveur.',
      'Ajuster les épices selon votre goût.',
      'Accompagner de légumes verts pour un repas équilibré.'
    ],
    nutrition: {
      calories: 380,
      protein: 35,
      carbs: 8,
      fat: 22,
      fiber: 2
    },
    createdBy: 'mock-user-1',
    ownerId: 'mock-user-1',
    createdAt: '2025-01-13T12:00:00.000Z',
    familyId: 'mock-family-1',
    visibility: 'family',
    isPublic: false,
    public: false,
    rating: 4.7,
    reviews: 15
  },
  {
    id: 'recipe-4',
    name: 'Riz Sauté aux Légumes',
    description: 'Riz parfumé sauté avec des légumes frais et des épices',
    image: '/images/recipes/riz-saute.jpg',
    prepTime: 15,
    cookTime: 25,
    servings: 6,
    difficulty: 'Facile',
    cuisine: 'camerounaise',
    categories: ['plats de riz'],
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: false,
      allergens: []
    },
    ingredients: [
      { name: 'Riz long grain', quantity: 400, unit: 'g', category: 'Céréales & Légumineuses' },
      { name: 'Huile végétale', quantity: 3, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Oignons', quantity: 1, unit: 'pièce', category: 'Légumes-feuilles & Aromates' },
      { name: 'Carottes', quantity: 2, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Haricots verts', quantity: 200, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Petits pois', quantity: 150, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 3, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Cube végétal', quantity: 2, unit: 'pièces', category: 'Huiles & Condiments' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' },
      { name: 'Poivre', quantity: 1, unit: 'pincée', category: 'Épices & Piments' }
    ],
    instructions: [
      'Laver et cuire le riz jusqu\'à ce qu\'il soit tendre.',
      'Couper tous les légumes en petits dés.',
      'Faire chauffer l\'huile dans une grande poêle.',
      'Faire revenir les oignons jusqu\'à ce qu\'ils soient dorés.',
      'Ajouter l\'ail et le gingembre hachés.',
      'Incorporer les carottes et cuire 5 minutes.',
      'Ajouter les haricots verts et les petits pois.',
      'Incorporer le riz cuit et mélanger délicatement.',
      'Assaisonner avec les cubes, le sel et le poivre.',
      'Faire sauter le tout pendant 5-7 minutes.',
      'Servir chaud en accompagnement ou plat principal.'
    ],
    tips: [
      'Utiliser du riz de la veille pour un meilleur résultat.',
      'Ajouter d\'autres légumes selon la saison.',
      'Parfait pour utiliser les restes de légumes.'
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 55,
      fat: 6,
      fiber: 4
    },
    createdBy: 'mock-user-3',
    ownerId: 'mock-user-3',
    createdAt: '2025-01-12T18:45:00.000Z',
    familyId: 'mock-family-1',
    visibility: 'private',
    isPublic: false,
    public: false,
    rating: 4.3,
    reviews: 9
  },
  {
    id: 'recipe-5',
    name: 'Achu Soup (Soupe Jaune)',
    description: 'Soupe traditionnelle camerounaise servie avec des tubercules pilés',
    image: '/images/recipes/achu.jpg',
    prepTime: 30,
    cookTime: 90,
    servings: 8,
    difficulty: 'Moyen',
    cuisine: 'camerounaise',
    categories: ['plats de tubercules', 'soupes & bouillons'],
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: false,
      allergens: ['fruits de mer']
    },
    ingredients: [
      { name: 'Macabo', quantity: 1, unit: 'kg', category: 'Tubercules & Plantains' },
      { name: 'Plantains verts', quantity: 4, unit: 'pièces', category: 'Tubercules & Plantains' },
      { name: 'Crevettes séchées', quantity: 150, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Poisson fumé', quantity: 200, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Huile de palme', quantity: 6, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Feuilles de kanwa', quantity: 100, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Oignons', quantity: 2, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 4, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Piment rouge', quantity: 2, unit: 'pièces', category: 'Épices & Piments' },
      { name: 'Cube Maggi', quantity: 2, unit: 'pièces', category: 'Huiles & Condiments' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' }
    ],
    instructions: [
      'Éplucher et couper les macabos et plantains en morceaux.',
      'Faire bouillir les tubercules jusqu\'à ce qu\'ils soient tendres.',
      'Égoutter et piler les tubercules jusqu\'à obtenir une pâte lisse.',
      'Dans une casserole, faire chauffer l\'huile de palme.',
      'Faire revenir les oignons, l\'ail et le gingembre.',
      'Ajouter les crevettes séchées et le poisson fumé.',
      'Incorporer les feuilles de kanwa et mélanger.',
      'Verser de l\'eau chaude pour faire une soupe.',
      'Assaisonner avec les cubes Maggi, le sel et le piment.',
      'Laisser mijoter 30 minutes en remuant régulièrement.',
      'Servir la soupe chaude avec les tubercules pilés.'
    ],
    tips: [
      'Bien piler les tubercules pour éviter les grumeaux.',
      'La consistance de la soupe doit être ni trop épaisse ni trop liquide.',
      'Servir immédiatement pour que les tubercules restent chauds.'
    ],
    nutrition: {
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 18,
      fiber: 6
    },
    createdBy: 'mock-user-2',
    ownerId: 'mock-user-2',
    createdAt: '2025-01-11T14:20:00.000Z',
    familyId: 'mock-family-1',
    visibility: 'family',
    isPublic: false,
    public: false,
    rating: 4.6,
    reviews: 11
  },
  {
    id: 'recipe-6',
    name: 'Beignets Haricots (Accra)',
    description: 'Beignets croustillants à base de haricots, parfaits pour le petit-déjeuner',
    image: '/images/recipes/beignets-haricots.jpg',
    prepTime: 60,
    cookTime: 30,
    servings: 6,
    difficulty: 'Moyen',
    cuisine: 'camerounaise',
    categories: ['street food', 'desserts locaux'],
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: false,
      allergens: []
    },
    ingredients: [
      { name: 'Haricots blancs', quantity: 500, unit: 'g', category: 'Céréales & Légumineuses' },
      { name: 'Oignons', quantity: 1, unit: 'pièce', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 3, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Piment rouge', quantity: 1, unit: 'pièce', category: 'Épices & Piments' },
      { name: 'Huile végétale', quantity: 500, unit: 'ml', category: 'Huiles & Condiments' },
      { name: 'Sel', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' },
      { name: 'Cube végétal', quantity: 1, unit: 'pièce', category: 'Huiles & Condiments' }
    ],
    instructions: [
      'Faire tremper les haricots dans l\'eau pendant 4-6 heures.',
      'Frotter les haricots pour enlever la peau.',
      'Rincer plusieurs fois jusqu\'à ce que l\'eau soit claire.',
      'Mixer les haricots avec un peu d\'eau pour obtenir une pâte.',
      'Ajouter les oignons, l\'ail, le gingembre et le piment mixés.',
      'Assaisonner avec le sel et le cube végétal écrasé.',
      'Battre la pâte vigoureusement pour l\'aérer.',
      'Faire chauffer l\'huile à 180°C.',
      'Former des boulettes avec une cuillère et les plonger dans l\'huile.',
      'Faire frire jusqu\'à ce qu\'ils soient dorés et croustillants.',
      'Égoutter sur du papier absorbant et servir chaud.'
    ],
    tips: [
      'Bien enlever toute la peau des haricots pour des beignets plus lisses.',
      'La pâte doit être bien aérée pour des beignets moelleux.',
      'Servir immédiatement avec du thé ou du café.'
    ],
    nutrition: {
      calories: 220,
      protein: 12,
      carbs: 25,
      fat: 8,
      fiber: 8
    },
    createdBy: 'mock-user-3',
    ownerId: 'mock-user-3',
    createdAt: '2025-01-10T08:30:00.000Z',
    familyId: 'mock-family-1',
    visibility: 'private',
    isPublic: false,
    public: false,
    rating: 4.4,
    reviews: 7
  },
  // PUBLIC RECIPES START HERE
  {
    id: 'public-recipe-1',
    name: 'Ndolé Traditionnel aux Crevettes',
    description: 'Recette authentique du plat national camerounais avec crevettes et arachides',
    image: '/images/recipes/default-meal.jpg',
    prepTime: 45,
    cookTime: 120,
    servings: 8,
    difficulty: 'Difficile',
    cuisine: 'camerounaise',
    categories: ['sauces traditionnelles', 'plats de fête'],
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: true,
      allergens: ['arachides', 'fruits de mer']
    },
    ingredients: [
      { name: 'Feuilles de ndolé fraîches', quantity: 800, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Crevettes séchées', quantity: 300, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Crevettes fraîches', quantity: 500, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Arachides crues', quantity: 400, unit: 'g', category: 'Céréales & Légumineuses' },
      { name: 'Viande de bœuf', quantity: 600, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Poisson fumé (machoiron)', quantity: 300, unit: 'g', category: 'Viandes & Poissons' },
      { name: 'Huile de palme rouge', quantity: 6, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Oignons', quantity: 3, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail', quantity: 8, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre frais', quantity: 2, unit: 'morceaux', category: 'Épices & Piments' },
      { name: 'Piment rouge fort', quantity: 3, unit: 'pièces', category: 'Épices & Piments' },
      { name: 'Cubes Maggi', quantity: 3, unit: 'pièces', category: 'Huiles & Condiments' },
      { name: 'Sel fin', quantity: 2, unit: 'cuillères à café', category: 'Huiles & Condiments' }
    ],
    instructions: [
      'Nettoyer soigneusement les feuilles de ndolé et les faire bouillir 30 minutes.',
      'Égoutter les feuilles et les presser pour enlever l\'amertume.',
      'Faire griller les arachides à sec puis les moudre finement.',
      'Couper la viande en morceaux et assaisonner avec sel et épices.',
      'Dans une grande marmite, faire chauffer l\'huile de palme.',
      'Faire revenir la viande jusqu\'à ce qu\'elle soit bien dorée.',
      'Ajouter les oignons, l\'ail et le gingembre hachés finement.',
      'Incorporer les crevettes séchées et le poisson fumé émietté.',
      'Ajouter les arachides moulues et mélanger soigneusement.',
      'Verser de l\'eau chaude pour couvrir et laisser mijoter 1 heure.',
      'Ajouter les feuilles de ndolé et les crevettes fraîches.',
      'Assaisonner avec les cubes Maggi, le sel et les piments.',
      'Laisser cuire encore 30 minutes en remuant régulièrement.',
      'Rectifier l\'assaisonnement et servir avec du riz blanc ou des tubercules.'
    ],
    tips: [
      'Choisir des feuilles de ndolé bien vertes et fraîches.',
      'Bien presser les feuilles après cuisson pour enlever l\'amertume.',
      'La consistance finale doit être crémeuse grâce aux arachides.',
      'Ce plat est encore meilleur réchauffé le lendemain.'
    ],
    nutrition: {
      calories: 485,
      protein: 32,
      carbs: 18,
      fat: 35,
      fiber: 10
    },
    createdBy: 'chef-public-1',
    ownerId: 'chef-public-1',
    createdAt: '2025-01-09T10:00:00.000Z',
    familyId: null,
    visibility: 'public',
    isPublic: true,
    public: true,
    rating: 4.9,
    reviews: 23,
    likes: 11,
    likedBy: ['user-1', 'user-3', 'user-7', 'user-12', 'user-15', 'user-18', 'user-22', 'user-25', 'user-28', 'user-31', 'user-34']
  },
  {
    id: 'public-recipe-2',
    name: 'Eru aux Légumes du Jardin',
    description: 'Soupe nutritive aux feuilles d\'eru et légumes frais, riche en vitamines',
    image: '/images/recipes/default-meal.jpg',
    prepTime: 25,
    cookTime: 45,
    servings: 6,
    difficulty: 'Facile',
    cuisine: 'camerounaise',
    categories: ['sauces traditionnelles', 'plats végétariens'],
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      containsNuts: false,
      allergens: []
    },
    ingredients: [
      { name: 'Feuilles d\'eru fraîches', quantity: 600, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Épinards frais', quantity: 300, unit: 'g', category: 'Légumes-feuilles & Aromates' },
      { name: 'Huile de palme', quantity: 4, unit: 'cuillères à soupe', category: 'Huiles & Condiments' },
      { name: 'Oignons rouges', quantity: 2, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Tomates fraîches', quantity: 4, unit: 'pièces', category: 'Légumes-feuilles & Aromates' },
      { name: 'Ail frais', quantity: 6, unit: 'gousses', category: 'Légumes-feuilles & Aromates' },
      { name: 'Gingembre frais', quantity: 1, unit: 'morceau', category: 'Épices & Piments' },
      { name: 'Piment vert doux', quantity: 2, unit: 'pièces', category: 'Épices & Piments' },
      { name: 'Cubes végétaux', quantity: 2, unit: 'pièces', category: 'Huiles & Condiments' },
      { name: 'Sel de mer', quantity: 1, unit: 'cuillère à café', category: 'Huiles & Condiments' }
    ],
    instructions: [
      'Nettoyer soigneusement les feuilles d\'eru et les épinards.',
      'Hacher finement les oignons, l\'ail et le gingembre.',
      'Couper les tomates en petits dés.',
      'Faire chauffer l\'huile de palme dans une grande casserole.',
      'Faire revenir les oignons jusqu\'à ce qu\'ils soient translucides.',
      'Ajouter l\'ail et le gingembre, faire revenir 2 minutes.',
      'Incorporer les tomates et cuire jusqu\'à ce qu\'elles se défassent.',
      'Ajouter les feuilles d\'eru et mélanger délicatement.',
      'Verser de l\'eau chaude pour couvrir les légumes.',
      'Ajouter les cubes végétaux et laisser mijoter 25 minutes.',
      'Incorporer les épinards et les piments verts.',
      'Assaisonner avec le sel et cuire encore 10 minutes.',
      'Servir chaud avec du riz complet ou des tubercules.'
    ],
    tips: [
      'Les feuilles d\'eru se trouvent dans les épiceries africaines.',
      'Ajouter les épinards en fin de cuisson pour préserver leur couleur.',
      'Excellent plat détox riche en fer et vitamines.',
      'Peut être servi en entrée ou plat principal.'
    ],
    nutrition: {
      calories: 195,
      protein: 9,
      carbs: 14,
      fat: 13,
      fiber: 8
    },
    createdBy: 'chef-public-2',
    ownerId: 'chef-public-2',
    createdAt: '2025-01-08T14:30:00.000Z',
    familyId: null,
    visibility: 'public',
    isPublic: true,
    public: true,
    rating: 4.6,
    reviews: 18,
    likes: 7,
    likedBy: ['user-2', 'user-5', 'user-9', 'user-14', 'user-19', 'user-23', 'user-27']
  }
];

// Firestore collection names
const RECIPE_COLLECTIONS = {
  recipes: 'recipes'
};

// Visibility types constant
const VISIBILITY_TYPES = {
  PRIVATE: 'private',
  FAMILY: 'family',
  PUBLIC: 'public'
};

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();
  const { currentFamily } = useFamily();
  const { showNotification } = useNotification();

  // Real-time Firestore listener for recipes
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create queries for different recipe types
      const queries = [
        // Public recipes
        query(
          collection(db, RECIPE_COLLECTIONS.recipes),
          where('visibility', '==', VISIBILITY_TYPES.PUBLIC)
        ),
        // Private recipes for current user
        query(
          collection(db, RECIPE_COLLECTIONS.recipes),
          where('createdBy', '==', currentUser.uid),
          where('visibility', '==', VISIBILITY_TYPES.PRIVATE)
        )
      ];

      // Add family recipes query only if user has a family
      if (currentFamily?.id) {
        queries.push(
          query(
            collection(db, RECIPE_COLLECTIONS.recipes),
            where('familyId', '==', currentFamily.id),
            where('visibility', '==', VISIBILITY_TYPES.FAMILY)
          )
        );
      }

      // Set up real-time listeners for all queries
      const unsubscribes = queries.map(q =>
        onSnapshot(q, (snapshot) => {
          const newRecipes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
          }));

          setRecipes(prev => {
            // Merge recipes from all queries, avoiding duplicates
            const allRecipes = [...prev];
            newRecipes.forEach(newRecipe => {
              const existingIndex = allRecipes.findIndex(r => r.id === newRecipe.id);
              if (existingIndex >= 0) {
                allRecipes[existingIndex] = newRecipe;
              } else {
                allRecipes.push(newRecipe);
              }
            });
            return allRecipes;
          });

          setLoading(false);
        }, (error) => {
          console.error('Error fetching recipes:', error);
          setError('Erreur lors du chargement des recettes');
          setLoading(false);
        })
      );

      // Cleanup function
      return () => {
        unsubscribes.forEach(unsubscribe => unsubscribe());
      };
    } catch (error) {
      console.error('Error setting up recipe listeners:', error);
      setError('Erreur lors de la configuration des recettes');
      setLoading(false);
    }
  }, [currentUser, currentFamily]);

  // Get all recipes
  const getAllRecipes = useCallback(() => {
    return recipes;
  }, [recipes]);

  // Get private recipes (only for current user)
  const getPrivateRecipes = useCallback((currentUserId) => {
    const userId = currentUserId || currentUser?.uid;
    return recipes.filter(recipe =>
      recipe.visibility === VISIBILITY_TYPES.PRIVATE &&
      recipe.createdBy === userId
    );
  }, [recipes, currentUser]);

  // Get family recipes (for current user's family)
  const getFamilyRecipes = useCallback((currentFamilyId) => {
    const familyId = currentFamilyId || currentFamily?.id;
    return recipes.filter(recipe =>
      recipe.visibility === VISIBILITY_TYPES.FAMILY &&
      recipe.familyId === familyId
    );
  }, [recipes, currentFamily]);

  // Get public recipes (available to all users)
  const getPublicRecipes = useCallback(() => {
    return recipes.filter(recipe =>
      recipe.visibility === VISIBILITY_TYPES.PUBLIC ||
      recipe.public === true ||
      recipe.isPublic === true
    );
  }, [recipes]);

  // Get recipe by ID
  const getRecipeById = useCallback((id) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  // Filter recipes by criteria
  const filterRecipes = (filters) => {
    return recipes.filter(recipe => {
      // Filter by cuisine
      if (filters.cuisine && recipe.cuisine !== filters.cuisine) {
        return false;
      }

      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        const hasCategory = filters.categories.some(cat =>
          recipe.categories.includes(cat)
        );
        if (!hasCategory) return false;
      }

      // Filter by dietary restrictions
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
        if (filters.dietaryRestrictions.includes('végétarien') && !recipe.dietaryInfo.isVegetarian) {
          return false;
        }
        if (filters.dietaryRestrictions.includes('végan') && !recipe.dietaryInfo.isVegan) {
          return false;
        }
        if (filters.dietaryRestrictions.includes('sans gluten') && !recipe.dietaryInfo.isGlutenFree) {
          return false;
        }
        if (filters.dietaryRestrictions.includes('sans produits laitiers') && !recipe.dietaryInfo.isDairyFree) {
          return false;
        }
      }

      // Filter by allergens (exclude recipes containing specified allergens)
      if (filters.allergens && filters.allergens.length > 0) {
        const hasAllergen = filters.allergens.some(allergen =>
          recipe.dietaryInfo.allergens.includes(allergen)
        );
        if (hasAllergen) return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = recipe.name.toLowerCase().includes(searchLower);
        const descMatch = recipe.description.toLowerCase().includes(searchLower);
        const ingredientMatch = recipe.ingredients.some(ing =>
          ing.name.toLowerCase().includes(searchLower)
        );
        if (!nameMatch && !descMatch && !ingredientMatch) {
          return false;
        }
      }

      return true;
    });
  };

  // Change recipe visibility in Firestore
  const changeRecipeVisibility = useCallback(async (recipeId, newVisibility, currentUserId, currentFamilyId, isAdmin = false) => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Check if family is required for the new visibility
    if (newVisibility === VISIBILITY_TYPES.FAMILY && !currentFamily) {
      throw new Error('Une famille est requise pour les recettes familiales');
    }

    try {
      setLoading(true);
      setError(null);

      const userId = currentUserId || currentUser.uid;
      const familyId = currentFamilyId || currentFamily?.id;

      const recipeRef = doc(db, RECIPE_COLLECTIONS.recipes, recipeId);

      // Check if recipe exists and user has permission
      const recipeDoc = await getDoc(recipeRef);
      if (!recipeDoc.exists()) {
        throw new Error('Recette non trouvée');
      }

      const recipeData = recipeDoc.data();

      // Recipe creators can always change visibility of their own recipes
      const isCreator = recipeData.createdBy === userId;

      // Family admins can change visibility of ANY recipe created by their family members
      // This includes private, family, and public recipes created by family members
      const isFamilyAdmin = isAdmin && familyId && (
        // For private and family recipes, check if they belong to the admin's family
        (recipeData.familyId === familyId) ||
        // For public recipes, we need to check if the creator is a family member
        // For now, we'll allow admins to manage any recipe if they have admin rights
        (recipeData.visibility === VISIBILITY_TYPES.PUBLIC && isAdmin)
      );

      // NEW: Enhanced admin editing permissions
      // Family admins can edit ANY recipe created by their family members
      // Exception: Private recipes can only be edited by their creators
      // Note: This logic is implemented in the UI components (RecipeCard, RecipeDialog)
      // const canAdminEdit = isAdmin && familyId && recipeData.familyId === familyId &&
      //                     recipeData.visibility !== VISIBILITY_TYPES.PRIVATE;

      if (!isCreator && !isFamilyAdmin) {
        throw new Error('Seuls le créateur de la recette et les admins familiaux peuvent modifier la visibilité');
      }

      // Track promotion history for ownership and attribution
      const currentVisibility = recipeData.visibility;
      const isPromotion = (currentVisibility === VISIBILITY_TYPES.PRIVATE && newVisibility === VISIBILITY_TYPES.FAMILY) ||
                         (currentVisibility === VISIBILITY_TYPES.PRIVATE && newVisibility === VISIBILITY_TYPES.PUBLIC) ||
                         (currentVisibility === VISIBILITY_TYPES.FAMILY && newVisibility === VISIBILITY_TYPES.PUBLIC);

      // Update visibility and related fields
      const updateData = {
        visibility: newVisibility,
        isPublic: newVisibility === VISIBILITY_TYPES.PUBLIC,
        public: newVisibility === VISIBILITY_TYPES.PUBLIC,
        updatedAt: serverTimestamp()
      };

      // Set appropriate IDs based on new visibility
      if (newVisibility === VISIBILITY_TYPES.PRIVATE) {
        updateData.familyId = familyId; // Keep family reference
      } else if (newVisibility === VISIBILITY_TYPES.FAMILY) {
        updateData.familyId = familyId;
      } else if (newVisibility === VISIBILITY_TYPES.PUBLIC) {
        updateData.familyId = null; // Public recipes don't belong to specific families
      }

      // Track ownership and promotion history
      if (isPromotion) {
        const promotionRecord = {
          from: currentVisibility,
          to: newVisibility,
          promotedBy: userId,
          promotedByName: currentUser.displayName || currentUser.email || 'Utilisateur',
          promotedAt: serverTimestamp()
        };

        // Initialize ownership if it doesn't exist
        const currentOwnership = recipeData.ownership || {
          originalCreator: recipeData.createdBy,
          currentOwner: recipeData.createdBy,
          canEdit: [recipeData.createdBy],
          lastPromotedBy: null,
          promotionHistory: []
        };

        updateData.ownership = {
          ...currentOwnership,
          lastPromotedBy: userId,
          promotionHistory: [...(currentOwnership.promotionHistory || []), promotionRecord],
          // Add promoter to edit permissions if promoting to public
          canEdit: newVisibility === VISIBILITY_TYPES.PUBLIC && !currentOwnership.canEdit.includes(userId)
            ? [...currentOwnership.canEdit, userId]
            : currentOwnership.canEdit
        };
      }

      await updateDoc(recipeRef, updateData);

      setLoading(false);
      showNotification('Visibilité de la recette mise à jour !', 'success');

      return true;
    } catch (error) {
      console.error('Error changing recipe visibility:', error);
      setError(error.message);
      setLoading(false);
      showNotification('Erreur lors de la modification de la visibilité', 'error');
      throw error;
    }
  }, [currentUser, currentFamily, showNotification]);

  // Import recipe functionality
  const importRecipe = useCallback(async (originalRecipe, importType, currentUserId, currentFamilyId, familyName = '', importerName = '') => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Check if family is required for family import
    if (importType === 'family' && !currentFamily) {
      throw new Error('Une famille est requise pour importer vers la famille');
    }

    try {
      setLoading(true);
      setError(null);

      const userId = currentUserId || currentUser.uid;
      const familyId = currentFamilyId || currentFamily?.id;

      // Generate new recipe ID
      const newRecipeRef = doc(collection(db, RECIPE_COLLECTIONS.recipes));

      // Determine new recipe name based on import type and ownership
      let newRecipeName = originalRecipe.name;
      const isOriginalCreatedByCurrentFamily = originalRecipe.familyId === familyId;

      if (importType === 'family' && !isOriginalCreatedByCurrentFamily) {
        newRecipeName = `${originalRecipe.name} (par ${familyName || 'Famille'})`;
      } else if (importType === 'private') {
        // Use actual importer's name instead of "Copie Privée"
        const displayName = importerName || currentUser.displayName || currentUser.email || 'Utilisateur';
        newRecipeName = `${originalRecipe.name} (importé par ${displayName})`;
      }

      // Create imported recipe
      const importedRecipe = {
        ...originalRecipe,
        id: newRecipeRef.id,
        name: newRecipeName,
        createdBy: userId,
        familyId: importType === 'family' ? familyId : familyId, // Keep family reference for private recipes
        visibility: importType === 'family' ? VISIBILITY_TYPES.FAMILY : VISIBILITY_TYPES.PRIVATE,
        isPublic: false,
        public: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Enhanced import tracking with attribution
        importedFrom: {
          originalRecipeId: originalRecipe.id,
          originalCreatedBy: originalRecipe.createdBy,
          originalCreatedByName: originalRecipe.createdByName || 'Utilisateur Inconnu',
          importedAt: serverTimestamp(),
          importedBy: userId,
          importedByName: importerName || currentUser.displayName || currentUser.email || 'Utilisateur',
          importType: importType
        },
        // Track ownership for editing permissions
        ownership: {
          originalCreator: originalRecipe.createdBy,
          currentOwner: userId,
          canEdit: [originalRecipe.createdBy, userId], // Both original creator and importer can edit
          lastPromotedBy: null, // Track who promoted to public
          promotionHistory: [] // Track visibility promotion history
        },
        // Reset social metrics for imported recipe
        rating: 0,
        reviews: 0,
        likedBy: []
      };

      await setDoc(newRecipeRef, importedRecipe);

      setLoading(false);
      showNotification(`Recette importée avec succès vers ${importType === 'family' ? 'la famille' : 'vos recettes privées'} !`, 'success');

      return { id: newRecipeRef.id, ...importedRecipe };
    } catch (error) {
      console.error('Error importing recipe:', error);
      setError(error.message);
      setLoading(false);
      showNotification('Erreur lors de l\'importation de la recette', 'error');
      throw error;
    }
  }, [currentUser, currentFamily, showNotification]);

  // Add new recipe to Firestore
  const addRecipe = useCallback(async (recipeData, currentUserId, currentFamilyId) => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Check if family is required for this recipe visibility
    if (recipeData.visibility === VISIBILITY_TYPES.FAMILY && !currentFamily) {
      throw new Error('Une famille est requise pour créer des recettes familiales');
    }

    try {
      setLoading(true);
      setError(null);

      const userId = currentUserId || currentUser.uid;
      const familyId = currentFamilyId || currentFamily?.id;

      // Create new recipe document
      const recipeRef = doc(collection(db, RECIPE_COLLECTIONS.recipes));
      const newRecipe = {
        ...recipeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        familyId: recipeData.visibility === VISIBILITY_TYPES.PUBLIC ? null : familyId,
        visibility: recipeData.visibility || VISIBILITY_TYPES.FAMILY,
        isPublic: recipeData.visibility === VISIBILITY_TYPES.PUBLIC,
        public: recipeData.visibility === VISIBILITY_TYPES.PUBLIC,
        rating: 0,
        reviews: 0,
        likedBy: [],
        // Ensure image is stored as base64 if provided
        imageUrl: recipeData.imageUrl || '/images/recipes/default-meal.jpg'
      };

      await setDoc(recipeRef, newRecipe);

      setLoading(false);
      showNotification('Recette créée avec succès !', 'success');

      return { id: recipeRef.id, ...newRecipe };
    } catch (error) {
      console.error('Error adding recipe:', error);
      setError('Erreur lors de la création de la recette');
      setLoading(false);
      showNotification('Erreur lors de la création de la recette', 'error');
      throw error;
    }
  }, [currentUser, currentFamily, showNotification]);

  // Update recipe in Firestore
  const updateRecipe = useCallback(async (id, updates) => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setLoading(true);
      setError(null);

      const recipeRef = doc(db, RECIPE_COLLECTIONS.recipes, id);

      // Check if recipe exists and user has permission
      const recipeDoc = await getDoc(recipeRef);
      if (!recipeDoc.exists()) {
        throw new Error('Recette non trouvée');
      }

      const recipeData = recipeDoc.data();
      const userId = currentUser.uid;

      // Get family admin status
      const isAdmin = currentFamily && currentUser?.role === 'admin';
      const familyId = currentFamily?.id;

      // Permission checking logic following MiamBidi requirements

      // 1. Recipe creators can always edit their own recipes
      const isCreator = recipeData.createdBy === userId;

      // 2. Check ownership-based editing permissions (for imported recipes)
      const canEditByOwnership = recipeData.ownership?.canEdit?.includes(userId) || false;

      // 3. Family admin permissions
      const canEditAsAdmin = isAdmin && familyId && (
        // For private and family recipes, check if they belong to the admin's family
        (recipeData.familyId === familyId) ||
        // For public recipes, allow admin editing if they have admin rights
        (recipeData.visibility === VISIBILITY_TYPES.PUBLIC && isAdmin)
      );

      // 4. Determine if user can edit this recipe
      const canEdit = isCreator || canEditByOwnership || canEditAsAdmin;

      if (!canEdit) {
        // Provide specific French error messages based on the scenario
        let errorMessage = 'Vous n\'avez pas la permission de modifier cette recette';

        if (recipeData.importedFrom) {
          // This is an imported recipe
          if (recipeData.visibility === VISIBILITY_TYPES.FAMILY) {
            errorMessage = 'Seuls l\'importateur de cette recette familiale et les admins familiaux peuvent la modifier';
          } else if (recipeData.visibility === VISIBILITY_TYPES.PRIVATE) {
            errorMessage = 'Seuls l\'importateur de cette recette privée et les admins familiaux peuvent la modifier';
          }
        } else if (recipeData.visibility === VISIBILITY_TYPES.PUBLIC) {
          errorMessage = 'Seuls le créateur de cette recette publique et les admins familiaux peuvent la modifier';
        } else if (recipeData.visibility === VISIBILITY_TYPES.FAMILY) {
          errorMessage = 'Seuls le créateur de cette recette familiale et les admins familiaux peuvent la modifier';
        } else if (recipeData.visibility === VISIBILITY_TYPES.PRIVATE) {
          errorMessage = 'Seuls le créateur de cette recette privée et les admins familiaux peuvent la modifier';
        }

        throw new Error(errorMessage);
      }

      // Update recipe with new data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(recipeRef, updateData);

      setLoading(false);
      showNotification('Recette mise à jour avec succès !', 'success');

      return true;
    } catch (error) {
      console.error('Error updating recipe:', error);
      setError(error.message);
      setLoading(false);
      showNotification('Erreur lors de la mise à jour de la recette', 'error');
      throw error;
    }
  }, [currentUser, currentFamily, showNotification]);

  // Delete recipe from Firestore
  const deleteRecipe = useCallback(async (id, isAdmin = false, adminFamilyId = null) => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setLoading(true);
      setError(null);

      const recipeRef = doc(db, RECIPE_COLLECTIONS.recipes, id);

      // Check if recipe exists and user has permission
      const recipeDoc = await getDoc(recipeRef);
      if (!recipeDoc.exists()) {
        throw new Error('Recette non trouvée');
      }

      const recipeData = recipeDoc.data();

      // Recipe creators can delete ANY recipe they created, regardless of visibility level
      const isCreator = recipeData.createdBy === currentUser.uid;

      // Family admins can delete ANY recipe within their family scope
      const isFamilyAdmin = isAdmin && adminFamilyId && (
        // For private and family recipes, check if they belong to the admin's family
        (recipeData.familyId === adminFamilyId) ||
        // For public recipes created by family members, allow admin deletion
        (recipeData.visibility === VISIBILITY_TYPES.PUBLIC && isAdmin)
      );

      if (!isCreator && !isFamilyAdmin) {
        const errorMessage = isAdmin
          ? 'Seuls le créateur de la recette et les admins familiaux peuvent supprimer cette recette'
          : 'Vous ne pouvez supprimer que vos propres recettes';
        throw new Error(errorMessage);
      }

      await deleteDoc(recipeRef);

      setLoading(false);
      showNotification('Recette supprimée avec succès !', 'success');

      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError(error.message);
      setLoading(false);
      showNotification('Erreur lors de la suppression de la recette', 'error');
      throw error;
    }
  }, [currentUser, showNotification]);

  // Get recipes compatible with family member preferences
  const getCompatibleRecipes = (memberPreferences) => {
    return filterRecipes({
      dietaryRestrictions: memberPreferences.dietaryRestrictions,
      allergens: memberPreferences.allergies,
      categories: memberPreferences.favoriteCategories
    });
  };

  // Future AI Integration Functions

  // Scale recipe for different number of servings
  const scaleRecipe = (recipeId, targetServings) => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return null;

    const scalingFactor = targetServings / recipe.scalingInfo.baseServings;

    const scaledIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * scalingFactor
    }));

    // Logarithmic scaling for cooking time (doesn't scale linearly)
    const scaledCookTime = recipe.scalingInfo.scalingFactors.cookingTime === 'logarithmic'
      ? Math.round(recipe.cookTime * Math.log(scalingFactor + 1) / Math.log(2) + recipe.cookTime)
      : Math.round(recipe.cookTime * scalingFactor);

    return {
      ...recipe,
      servings: targetServings,
      ingredients: scaledIngredients,
      cookTime: Math.max(scaledCookTime, recipe.cookTime), // Never less than original
      prepTime: Math.round(recipe.prepTime * scalingFactor)
    };
  };

  // Generate recipe from meal name (placeholder for AI integration)
  const generateRecipeFromMealName = async (mealName, preferences = {}) => {
    // This would integrate with Gemini AI API
    // For now, return a placeholder structure
    return {
      id: `ai-recipe-${Date.now()}`,
      name: mealName,
      description: `Recette générée automatiquement pour ${mealName}`,
      aiGenerated: {
        isAiGenerated: true,
        generatedFrom: 'meal-name',
        aiConfidenceScore: 0.85,
        lastAiUpdate: new Date().toISOString()
      },
      // ... other recipe fields would be AI-generated
    };
  };

  // Auto-match image based on recipe name
  const autoMatchImage = (recipeName) => {
    const normalizedName = recipeName.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/\s+/g, '-');

    // Check if image exists in our predefined list
    const imageMap = {
      'ndole': '/images/recipes/ndole.jpg',
      'eru': '/images/recipes/eru.jpg',
      'poulet-braise': '/images/recipes/poulet-braise.jpg',
      'riz-saute': '/images/recipes/riz-saute.jpg',
      'achu': '/images/recipes/achu.jpg',
      'beignets-haricots': '/images/recipes/beignets-haricots.jpg',
      'plantains-frits': '/images/recipes/plantains-frits.jpg',
      'sauce-arachide': '/images/recipes/sauce-arachide.jpg',
      'poisson-braise': '/images/recipes/poisson-braise.jpg',
      'koki': '/images/recipes/koki.jpg'
    };

    // Find best match
    for (const [key, imagePath] of Object.entries(imageMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName.split('-')[0])) {
        return imagePath;
      }
    }

    return null;
  };

  // Generate nutritional information (placeholder for AI)
  const generateNutrition = async (ingredients, servings) => {
    // This would integrate with nutrition API or AI
    // For now, return estimated values
    const estimatedCalories = ingredients.reduce((total, ing) => {
      // Simple estimation based on ingredient types
      const calorieMap = {
        'viande': 250,
        'poisson': 200,
        'huile': 900,
        'riz': 350,
        'légumes': 25
      };

      // Basic estimation logic
      return total + (calorieMap['légumes'] || 100) * (ing.quantity / 100);
    }, 0);

    return {
      calories: Math.round(estimatedCalories / servings),
      protein: Math.round(estimatedCalories * 0.15 / 4), // 15% protein
      carbs: Math.round(estimatedCalories * 0.55 / 4), // 55% carbs
      fat: Math.round(estimatedCalories * 0.30 / 9), // 30% fat
      fiber: Math.round(estimatedCalories * 0.05 / 4) // 5% fiber
    };
  };

  // Meal Planning Functions (Placeholder for Future Implementation)

  // Plan a meal for a specific date and meal type
  const planMealForDate = (date, recipeId, mealType = 'dinner') => {
    // This will integrate with a meal planning context/database
    // For now, return a placeholder structure
    console.log(`Planning meal: ${recipeId} for ${date} (${mealType})`);

    return {
      id: `meal-plan-${Date.now()}`,
      date: date,
      mealType: mealType, // 'breakfast', 'lunch', 'dinner', 'snack'
      recipeId: recipeId,
      servings: null, // Will be calculated based on family size
      status: 'planned', // 'planned', 'prepared', 'completed'
      createdAt: new Date().toISOString(),
      familyId: 'mock-family-1'
    };
  };

  // Generate shopping list from planned meals for a date range
  const generateWeeklyShoppingList = (startDate, endDate) => {
    // This will aggregate ingredients from all planned meals in the date range
    // For now, return a placeholder structure
    console.log(`Generating shopping list from ${startDate} to ${endDate}`);

    // In the future, this will:
    // 1. Get all planned meals in the date range
    // 2. Extract ingredients from each recipe
    // 3. Aggregate quantities by ingredient and category
    // 4. Account for family size and recipe scaling
    // 5. Remove items already in pantry (future feature)

    return {
      id: `shopping-list-${Date.now()}`,
      startDate: startDate,
      endDate: endDate,
      categories: {
        'Tubercules & Plantains': [
          { name: 'Macabo', quantity: 2, unit: 'kg', recipes: ['recipe-1'] },
          { name: 'Plantains verts', quantity: 8, unit: 'pièces', recipes: ['recipe-1'] }
        ],
        'Viandes & Poissons': [
          { name: 'Crevettes séchées', quantity: 350, unit: 'g', recipes: ['recipe-1', 'recipe-5'] },
          { name: 'Poisson fumé', quantity: 400, unit: 'g', recipes: ['recipe-1', 'recipe-5'] }
        ],
        'Légumes-feuilles & Aromates': [
          { name: 'Feuilles de ndolé', quantity: 500, unit: 'g', recipes: ['recipe-1'] },
          { name: 'Oignons', quantity: 5, unit: 'pièces', recipes: ['recipe-1', 'recipe-2', 'recipe-3'] }
        ]
        // ... other categories
      },
      totalItems: 0,
      estimatedCost: 0,
      generatedAt: new Date().toISOString(),
      familyId: 'mock-family-1'
    };
  };

  // Generate AI-powered meal suggestions based on family preferences
  const generateMealSuggestions = async (familyPreferences, dietaryRestrictions = []) => {
    // This will integrate with Gemini AI API for intelligent meal suggestions
    // For now, return placeholder suggestions based on existing recipes
    console.log('Generating meal suggestions for family preferences:', familyPreferences);

    // In the future, this will:
    // 1. Analyze family member preferences and restrictions
    // 2. Consider seasonal ingredients and availability
    // 3. Balance nutritional requirements across the week
    // 4. Avoid repetition and suggest variety
    // 5. Account for cooking time and difficulty preferences
    // 6. Generate new recipes if needed using AI

    const compatibleRecipes = getCompatibleRecipes({
      dietaryRestrictions: dietaryRestrictions,
      allergies: familyPreferences.commonAllergies || [],
      favoriteCategories: familyPreferences.favoriteCategories || []
    });

    return {
      suggestions: compatibleRecipes.slice(0, 7).map((recipe, index) => ({
        day: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][index],
        mealType: 'dinner',
        recipe: recipe,
        reason: `Recommandé pour les préférences de ${familyPreferences.memberName || 'la famille'}`,
        confidence: 0.85,
        nutritionalBalance: 'good',
        preparationTime: recipe.prepTime + recipe.cookTime
      })),
      weeklyNutrition: {
        averageCalories: 380,
        proteinBalance: 'good',
        varietyScore: 0.8,
        culturalRelevance: 0.9
      },
      generatedAt: new Date().toISOString(),
      aiModel: 'gemini-pro', // Future integration
      familyId: 'mock-family-1'
    };
  };

  // Get meal plan for a specific date range
  const getMealPlan = (startDate, endDate) => {
    // Placeholder for retrieving planned meals
    // This will integrate with a meal planning database/context
    return [];
  };

  // Update meal plan status (planned -> prepared -> completed)
  const updateMealStatus = (mealPlanId, status) => {
    // Placeholder for updating meal preparation status
    console.log(`Updating meal ${mealPlanId} status to ${status}`);
    return true;
  };

  const value = {
    recipes,
    loading,
    error,
    VISIBILITY_TYPES,
    getAllRecipes,
    getPrivateRecipes,
    getFamilyRecipes,
    getPublicRecipes,
    getRecipeById,
    filterRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    changeRecipeVisibility,
    importRecipe,
    getCompatibleRecipes,
    // AI Integration Functions
    scaleRecipe,
    generateRecipeFromMealName,
    autoMatchImage,
    generateNutrition,
    // Meal Planning Functions (Future Implementation)
    planMealForDate,
    generateWeeklyShoppingList,
    generateMealSuggestions,
    getMealPlan,
    updateMealStatus
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}
