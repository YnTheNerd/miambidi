/**
 * Demo Data Generator for Seller Marketplace
 * Creates realistic seller profiles and stocks for Yaoundé, Cameroon
 */

import { DEFAULT_SELLER_PROFILE } from '../types/seller';
import { generateSellerStock } from './stockGenerator';

// Realistic Yaoundé locations with coordinates
const YAOUNDE_LOCATIONS = [
  {
    name: 'Marché Central',
    coordinates: { lat: 3.8667, lng: 11.5167 },
    address: 'Avenue Kennedy, Centre-ville',
    city: 'Yaoundé',
    neighborhood: 'Centre-ville'
  },
  {
    name: 'Marché Mokolo',
    coordinates: { lat: 3.8833, lng: 11.5000 },
    address: 'Quartier Mokolo',
    city: 'Yaoundé',
    neighborhood: 'Mokolo'
  },
  {
    name: 'Marché de Mfoundi',
    coordinates: { lat: 3.8500, lng: 11.5333 },
    address: 'Quartier Mfoundi',
    city: 'Yaoundé',
    neighborhood: 'Mfoundi'
  },
  {
    name: 'Bastos',
    coordinates: { lat: 3.8833, lng: 11.5333 },
    address: 'Quartier Bastos',
    city: 'Yaoundé',
    neighborhood: 'Bastos'
  },
  {
    name: 'Emombo',
    coordinates: { lat: 3.8167, lng: 11.5000 },
    address: 'Quartier Emombo',
    city: 'Yaoundé',
    neighborhood: 'Emombo'
  },
  {
    name: 'Essos',
    coordinates: { lat: 3.8667, lng: 11.5500 },
    address: 'Quartier Essos',
    city: 'Yaoundé',
    neighborhood: 'Essos'
  },
  {
    name: 'Mvog-Ada',
    coordinates: { lat: 3.8333, lng: 11.5167 },
    address: 'Quartier Mvog-Ada',
    city: 'Yaoundé',
    neighborhood: 'Mvog-Ada'
  },
  {
    name: 'Nlongkak',
    coordinates: { lat: 3.9000, lng: 11.5167 },
    address: 'Quartier Nlongkak',
    city: 'Yaoundé',
    neighborhood: 'Nlongkak'
  },
  {
    name: 'Mendong',
    coordinates: { lat: 3.8000, lng: 11.4833 },
    address: 'Quartier Mendong',
    city: 'Yaoundé',
    neighborhood: 'Mendong'
  },
  {
    name: 'Nkol-Eton',
    coordinates: { lat: 3.8500, lng: 11.4667 },
    address: 'Quartier Nkol-Eton',
    city: 'Yaoundé',
    neighborhood: 'Nkol-Eton'
  }
];

// Cameroonian business names and descriptions
const DEMO_SELLERS = [
  {
    shopName: 'Marché Mama Ngozi',
    description: 'Spécialiste des légumes frais et produits locaux. Plus de 20 ans d\'expérience au service des familles de Yaoundé.',
    businessType: 'Légumes et fruits',
    specialties: ['Légumes-feuilles & Aromates', 'Légumes', 'Fruits']
  },
  {
    shopName: 'Boucherie Moderne Cameroun',
    description: 'Viandes fraîches de qualité supérieure. Bœuf, porc, agneau et volaille. Découpe sur mesure.',
    businessType: 'Boucherie',
    specialties: ['Viandes & Poissons']
  },
  {
    shopName: 'Épicerie Tante Marie',
    description: 'Votre épicerie de quartier avec tous les produits essentiels. Céréales, épices, conserves et plus.',
    businessType: 'Épicerie générale',
    specialties: ['Céréales & Légumineuses', 'Épices & Condiments', 'Huiles & Matières grasses']
  },
  {
    shopName: 'Poissonnerie du Wouri',
    description: 'Poissons frais du jour, crevettes et fruits de mer. Directement des côtes camerounaises.',
    businessType: 'Poissonnerie',
    specialties: ['Viandes & Poissons']
  },
  {
    shopName: 'Ferme Bio Cameroun',
    description: 'Produits biologiques et naturels. Légumes sans pesticides, fruits de saison, produits fermiers.',
    businessType: 'Agriculture biologique',
    specialties: ['Légumes', 'Fruits', 'Produits laitiers']
  },
  {
    shopName: 'Marché Traditionnel Beti',
    description: 'Produits traditionnels camerounais. Feuilles de manioc, plantain, igname, épices locales.',
    businessType: 'Produits traditionnels',
    specialties: ['Légumes-feuilles & Aromates', 'Légumes', 'Épices & Condiments']
  },
  {
    shopName: 'Superette Moderne Plus',
    description: 'Superette moderne avec un large choix de produits. Livraison rapide dans tout Yaoundé.',
    businessType: 'Superette',
    specialties: ['Céréales & Légumineuses', 'Produits laitiers', 'Boissons']
  },
  {
    shopName: 'Fruits & Légumes Tropicaux',
    description: 'Spécialiste des fruits tropicaux. Mangues, ananas, papayes, avocats et légumes de saison.',
    businessType: 'Fruits et légumes',
    specialties: ['Fruits', 'Légumes']
  },
  {
    shopName: 'Boulangerie Pâtisserie Étoile',
    description: 'Pain frais quotidien, pâtisseries et viennoiseries. Ingrédients de boulangerie disponibles.',
    businessType: 'Boulangerie',
    specialties: ['Céréales & Légumineuses', 'Produits laitiers']
  },
  {
    shopName: 'Marché Nocturne Yaoundé',
    description: 'Ouvert tard le soir pour vos achats de dernière minute. Produits frais et de qualité.',
    businessType: 'Marché nocturne',
    specialties: ['Légumes', 'Fruits', 'Viandes & Poissons']
  }
];

// Phone number prefixes for Cameroon
const PHONE_PREFIXES = ['237650', '237651', '237652', '237653', '237654', '237655', '237656', '237657', '237658', '237659'];

/**
 * Generates a realistic Cameroonian phone number
 */
function generatePhoneNumber() {
  const prefix = PHONE_PREFIXES[Math.floor(Math.random() * PHONE_PREFIXES.length)];
  const suffix = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return `+${prefix}${suffix}`;
}

/**
 * Generates operating hours
 */
function generateOperatingHours() {
  const baseHours = {
    monday: { open: '07:00', close: '19:00', closed: false },
    tuesday: { open: '07:00', close: '19:00', closed: false },
    wednesday: { open: '07:00', close: '19:00', closed: false },
    thursday: { open: '07:00', close: '19:00', closed: false },
    friday: { open: '07:00', close: '19:00', closed: false },
    saturday: { open: '07:00', close: '20:00', closed: false },
    sunday: { open: '08:00', close: '18:00', closed: Math.random() > 0.7 } // 30% chance closed on Sunday
  };

  // Some variation in hours
  const variations = [
    { open: '06:00', close: '18:00' }, // Early bird
    { open: '08:00', close: '20:00' }, // Late hours
    { open: '07:30', close: '19:30' }  // Standard plus
  ];

  const variation = variations[Math.floor(Math.random() * variations.length)];
  
  Object.keys(baseHours).forEach(day => {
    if (!baseHours[day].closed) {
      baseHours[day].open = variation.open;
      baseHours[day].close = variation.close;
    }
  });

  return baseHours;
}

/**
 * Generates realistic seller statistics
 */
function generateSellerStats() {
  const totalOrders = Math.floor(Math.random() * 500) + 50;
  const completedOrders = Math.floor(totalOrders * (0.85 + Math.random() * 0.1)); // 85-95% completion rate
  const averageRating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0 rating
  const totalRevenue = completedOrders * (5000 + Math.random() * 15000); // Average order 5k-20k FCFA

  return {
    totalOrders,
    completedOrders,
    averageRating: Math.round(averageRating * 10) / 10,
    totalRevenue: Math.floor(totalRevenue),
    activeStock: 0 // Will be updated when stock is generated
  };
}

/**
 * Creates a demo seller profile
 */
export function createDemoSeller(index) {
  const sellerData = DEMO_SELLERS[index % DEMO_SELLERS.length];
  const location = YAOUNDE_LOCATIONS[index % YAOUNDE_LOCATIONS.length];
  const phoneNumber = generatePhoneNumber();
  const whatsappNumber = Math.random() > 0.3 ? generatePhoneNumber() : null; // 70% have WhatsApp

  return {
    id: `demo-seller-${index + 1}`,
    uid: `demo-seller-uid-${index + 1}`,
    email: `${sellerData.shopName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@miambidi.cm`,
    displayName: sellerData.shopName,
    role: 'seller',
    
    shopName: sellerData.shopName,
    description: sellerData.description,
    logoUrl: null, // Could add placeholder logos later
    
    location: {
      address: location.address,
      city: location.city,
      coordinates: {
        lat: location.coordinates.lat + (Math.random() - 0.5) * 0.01, // Small random offset
        lng: location.coordinates.lng + (Math.random() - 0.5) * 0.01
      },
      deliveryRadius: 3 + Math.floor(Math.random() * 8) // 3-10 km radius
    },
    
    businessInfo: {
      registrationNumber: `RC/YAO/${2020 + Math.floor(Math.random() * 4)}/B/${1000 + index}`,
      taxId: `${index + 1}${Math.floor(Math.random() * 900000) + 100000}`,
      phoneNumber,
      whatsappNumber,
      operatingHours: generateOperatingHours()
    },
    
    settings: {
      acceptsRequests: true,
      autoAcceptRequests: Math.random() > 0.7, // 30% auto-accept
      minimumOrderValue: [500, 1000, 1500, 2000][Math.floor(Math.random() * 4)],
      deliveryFee: [300, 500, 700, 1000][Math.floor(Math.random() * 4)],
      acceptsDelivery: Math.random() > 0.2, // 80% offer delivery
      acceptsPickup: true
    },
    
    stats: generateSellerStats(),
    
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last year
    updatedAt: new Date().toISOString(),
    isActive: Math.random() > 0.1, // 90% active
    isVerified: Math.random() > 0.4, // 60% verified
    
    // Additional metadata
    businessType: sellerData.businessType,
    specialties: sellerData.specialties,
    neighborhood: location.neighborhood
  };
}

/**
 * Generates demo stock for a seller based on their specialties
 */
export function generateDemoStock(seller, recipes = []) {
  // Create mock recipes if none provided
  const mockRecipes = recipes.length > 0 ? recipes : [
    {
      id: 'mock-1',
      name: 'Ndolé',
      isPublic: true,
      ingredients: [
        { name: 'Feuilles de ndolé', category: 'Légumes-feuilles & Aromates' },
        { name: 'Arachides', category: 'Céréales & Légumineuses' },
        { name: 'Viande de bœuf', category: 'Viandes & Poissons' },
        { name: 'Crevettes', category: 'Viandes & Poissons' },
        { name: 'Huile de palme', category: 'Huiles & Matières grasses' }
      ]
    },
    {
      id: 'mock-2',
      name: 'Poulet DG',
      isPublic: true,
      ingredients: [
        { name: 'Poulet', category: 'Viandes & Poissons' },
        { name: 'Plantain', category: 'Légumes' },
        { name: 'Carotte', category: 'Légumes' },
        { name: 'Haricots verts', category: 'Légumes' },
        { name: 'Cube maggi', category: 'Épices & Condiments' }
      ]
    }
  ];

  // Filter stock generation based on seller specialties
  const categoryFilter = seller.specialties && seller.specialties.length > 0 
    ? seller.specialties[Math.floor(Math.random() * seller.specialties.length)]
    : null;

  const stock = generateSellerStock(mockRecipes, seller, {
    maxItems: 20 + Math.floor(Math.random() * 30), // 20-50 items
    includePopularOnly: false,
    categoryFilter
  });

  // Update seller stats with stock count
  seller.stats.activeStock = stock.length;

  return stock.map((item, index) => ({
    ...item,
    id: `${seller.id}-stock-${index + 1}`,
    sellerId: seller.id,
    addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
    lastUpdated: new Date().toISOString()
  }));
}

/**
 * Creates complete demo data set
 */
export function generateCompleteSellerDemoData(count = 10, recipes = []) {
  const sellers = [];
  const allStock = [];

  for (let i = 0; i < count; i++) {
    const seller = createDemoSeller(i);
    const stock = generateDemoStock(seller, recipes);
    
    sellers.push(seller);
    allStock.push(...stock);
  }

  return {
    sellers,
    stock: allStock,
    summary: {
      totalSellers: sellers.length,
      activeSellers: sellers.filter(s => s.isActive).length,
      verifiedSellers: sellers.filter(s => s.isVerified).length,
      totalStockItems: allStock.length,
      averageStockPerSeller: Math.round(allStock.length / sellers.length)
    }
  };
}

export default {
  createDemoSeller,
  generateDemoStock,
  generateCompleteSellerDemoData,
  YAOUNDE_LOCATIONS,
  DEMO_SELLERS
};
