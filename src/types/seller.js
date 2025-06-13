/**
 * Seller Types and Schemas for MiamBidi Marketplace
 * Defines seller user role, stock management, and marketplace functionality
 */

// Seller User Profile Schema
export const SellerProfileSchema = {
  id: 'string', // unique seller identifier
  uid: 'string', // Firebase Auth UID
  email: 'string',
  displayName: 'string',
  role: 'seller', // user role
  
  // Seller-specific information
  shopName: 'string', // business name
  description: 'string', // short business description
  logoUrl: 'string|null', // shop logo image URL
  
  // Location information
  location: {
    address: 'string',
    city: 'string',
    coordinates: {
      lat: 'number',
      lng: 'number'
    },
    deliveryRadius: 'number' // in kilometers
  },
  
  // Business information
  businessInfo: {
    registrationNumber: 'string|null',
    taxId: 'string|null',
    phoneNumber: 'string',
    whatsappNumber: 'string|null',
    operatingHours: {
      monday: { open: 'string', close: 'string', closed: 'boolean' },
      tuesday: { open: 'string', close: 'string', closed: 'boolean' },
      wednesday: { open: 'string', close: 'string', closed: 'boolean' },
      thursday: { open: 'string', close: 'string', closed: 'boolean' },
      friday: { open: 'string', close: 'string', closed: 'boolean' },
      saturday: { open: 'string', close: 'string', closed: 'boolean' },
      sunday: { open: 'string', close: 'string', closed: 'boolean' }
    }
  },
  
  // Marketplace settings
  settings: {
    acceptsRequests: 'boolean',
    autoAcceptRequests: 'boolean',
    minimumOrderValue: 'number', // in FCFA
    deliveryFee: 'number', // in FCFA
    acceptsDelivery: 'boolean',
    acceptsPickup: 'boolean'
  },
  
  // Statistics
  stats: {
    totalOrders: 'number',
    completedOrders: 'number',
    averageRating: 'number',
    totalRevenue: 'number',
    activeStock: 'number'
  },
  
  // Metadata
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  isActive: 'boolean',
  isVerified: 'boolean'
};

// Seller Stock Item Schema
export const SellerStockSchema = {
  id: 'string', // unique stock item identifier
  sellerId: 'string', // reference to seller
  ingredientId: 'string', // reference to ingredient
  ingredientName: 'string', // denormalized for quick access
  
  // Stock information
  quantity: 'number',
  unit: 'string',
  pricePerUnit: 'number', // in FCFA
  originalPrice: 'number', // original purchase price
  
  // Product details
  quality: 'string', // 'premium', 'standard', 'economy'
  origin: 'string|null', // where the product comes from
  brand: 'string|null',
  expiryDate: 'timestamp|null',
  
  // Availability
  isAvailable: 'boolean',
  minimumQuantity: 'number', // minimum order quantity
  maximumQuantity: 'number|null', // maximum order quantity
  
  // Metadata
  addedAt: 'timestamp',
  lastUpdated: 'timestamp',
  notes: 'string|null'
};

// Shopping List Request Schema
export const ShoppingListRequestSchema = {
  id: 'string', // unique request identifier
  familyId: 'string', // requesting family
  sellerId: 'string', // target seller
  
  // Request details
  requestedItems: 'array', // array of requested items with quantities
  message: 'string|null', // optional message from family
  urgency: 'string', // 'low', 'medium', 'high'
  preferredDeliveryDate: 'timestamp|null',
  deliveryMethod: 'string', // 'pickup', 'delivery'
  
  // Status tracking
  status: 'string', // 'pending', 'accepted', 'rejected', 'completed'
  sellerResponse: {
    message: 'string|null',
    availableItems: 'array', // items seller can fulfill
    totalPrice: 'number|null',
    estimatedDeliveryTime: 'string|null',
    respondedAt: 'timestamp|null'
  },
  
  // Metadata
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  expiresAt: 'timestamp' // auto-expire after 24 hours
};

// Seller Response Schema
export const SellerResponseSchema = {
  id: 'string', // unique response identifier
  requestId: 'string', // reference to original request
  sellerId: 'string',
  familyId: 'string',
  
  // Response details
  status: 'string', // 'accepted', 'partial', 'rejected'
  availableItems: 'array', // items with quantities and prices
  unavailableItems: 'array', // items not available
  totalPrice: 'number',
  
  // Delivery information
  deliveryMethod: 'string', // 'pickup', 'delivery'
  estimatedTime: 'string', // e.g., "2 heures", "demain matin"
  deliveryFee: 'number',
  
  // Messages
  message: 'string|null',
  specialOffers: 'string|null', // any special deals or substitutions
  
  // Client interaction
  clientStatus: 'string', // 'pending', 'accepted', 'rejected'
  clientAcceptedAt: 'timestamp|null',
  
  // Metadata
  createdAt: 'timestamp',
  expiresAt: 'timestamp' // expires after 24 hours if not accepted
};

// Default values
export const DEFAULT_SELLER_PROFILE = {
  shopName: '',
  description: '',
  logoUrl: null,
  location: {
    address: '',
    city: '',
    coordinates: { lat: 0, lng: 0 },
    deliveryRadius: 5
  },
  businessInfo: {
    registrationNumber: null,
    taxId: null,
    phoneNumber: '',
    whatsappNumber: null,
    operatingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    }
  },
  settings: {
    acceptsRequests: true,
    autoAcceptRequests: false,
    minimumOrderValue: 1000, // 1000 FCFA
    deliveryFee: 500, // 500 FCFA
    acceptsDelivery: true,
    acceptsPickup: true
  },
  stats: {
    totalOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalRevenue: 0,
    activeStock: 0
  },
  isActive: true,
  isVerified: false
};

// Firebase Collections
export const SELLER_COLLECTIONS = {
  sellers: 'sellers', // /sellers/{sellerId}
  sellerStock: 'seller-stock', // /seller-stock/{stockId}
  shoppingRequests: 'shopping-requests', // /shopping-requests/{requestId}
  sellerResponses: 'seller-responses', // /seller-responses/{responseId}
  
  // Subcollections
  stock: 'stock', // /sellers/{sellerId}/stock/{stockId}
  requests: 'requests', // /sellers/{sellerId}/requests/{requestId}
  responses: 'responses' // /families/{familyId}/responses/{responseId}
};

// Seller UI Theme Colors
export const SELLER_THEME = {
  primary: '#d2eb34', // Yellow-green primary color
  secondary: '#b8d62f',
  accent: '#9bc53d',
  background: '#f8fdf0',
  surface: '#ffffff',
  text: {
    primary: '#2d3748',
    secondary: '#4a5568',
    disabled: '#a0aec0'
  },
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  info: '#4299e1'
};

// Utility functions
export const SellerUtils = {
  /**
   * Calculates distance between two coordinates
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  /**
   * Checks if seller is within delivery radius
   */
  isWithinDeliveryRadius(sellerLocation, clientLocation) {
    const distance = this.calculateDistance(
      sellerLocation.coordinates.lat,
      sellerLocation.coordinates.lng,
      clientLocation.lat,
      clientLocation.lng
    );
    return distance <= sellerLocation.deliveryRadius;
  },

  /**
   * Formats seller operating hours
   */
  formatOperatingHours(operatingHours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    return days.map((day, index) => {
      const hours = operatingHours[day];
      return {
        day: dayNames[index],
        hours: hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`
      };
    });
  },

  /**
   * Calculates total price for items
   */
  calculateTotalPrice(items) {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.pricePerUnit);
    }, 0);
  }
};

export default {
  SellerProfileSchema,
  SellerStockSchema,
  ShoppingListRequestSchema,
  SellerResponseSchema,
  DEFAULT_SELLER_PROFILE,
  SELLER_COLLECTIONS,
  SELLER_THEME,
  SellerUtils
};
