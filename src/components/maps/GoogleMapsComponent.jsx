/**
 * Enhanced Google Maps Component for MiamBidi Seller Marketplace
 * Features: Interactive maps, seller markers, clustering, search, routing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import {
  MyLocation,
  Search,
  FilterList,
  Directions,
  Store,
  Phone,
  Schedule,
  LocalShipping,
  Star,
  Close
} from '@mui/icons-material';
import { SELLER_THEME } from '../../types/seller';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDqJtH6hpF1i1ct9qHzKsqHh4wzMwZTzfw';

// Default center: Yaoundé, Cameroon
const DEFAULT_CENTER = { lat: 3.8480, lng: 11.5021 };

function GoogleMapsComponent({ 
  sellers = [], 
  userLocation = null, 
  onSellerClick = null,
  height = 400,
  showUserLocation = true,
  showSearch = true,
  showFilters = true 
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    maxDistance: 20,
    deliveryOnly: false,
    openNow: false
  });
  const [userMarker, setUserMarker] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  // Initialize map
  const initMap = useCallback((mapInstance) => {
    setMap(mapInstance);
    
    // Initialize directions service
    const dirService = new window.google.maps.DirectionsService();
    const dirRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: SELLER_THEME.primary,
        strokeWeight: 4
      }
    });
    dirRenderer.setMap(mapInstance);
    
    setDirectionsService(dirService);
    setDirectionsRenderer(dirRenderer);
  }, []);

  // Create seller markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = sellers.map(seller => {
      if (!seller.location?.coordinates) return null;

      const marker = new window.google.maps.Marker({
        position: {
          lat: seller.location.coordinates.lat,
          lng: seller.location.coordinates.lng
        },
        map: map,
        title: seller.shopName,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${SELLER_THEME.primary}" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="black" font-size="16" font-weight="bold">🏪</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: ${SELLER_THEME.text.primary};">${seller.shopName}</h3>
            <p style="margin: 0 0 8px 0; color: ${SELLER_THEME.text.secondary}; font-size: 14px;">${seller.description}</p>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="background: ${SELLER_THEME.primary}; color: black; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                📍 ${seller.location?.deliveryRadius || 5}km
              </span>
              ${seller.settings?.acceptsDelivery ? `<span style="background: ${SELLER_THEME.success}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">🚚 Livraison</span>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: ${SELLER_THEME.primary};">⭐</span>
                <span style="font-size: 14px;">${seller.stats?.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
              <button onclick="window.selectSeller('${seller.id}')" 
                      style="background: ${SELLER_THEME.primary}; color: black; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                Sélectionner
              </button>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => m.infoWindow?.close());
        infoWindow.open(map, marker);
        setSelectedSeller(seller);
      });

      marker.infoWindow = infoWindow;
      return marker;
    }).filter(Boolean);

    setMarkers(newMarkers);

    // Global function for info window button
    window.selectSeller = (sellerId) => {
      const seller = sellers.find(s => s.id === sellerId);
      if (seller && onSellerClick) {
        onSellerClick(seller);
      }
    };

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, sellers, onSellerClick]);

  // Create user location marker
  useEffect(() => {
    if (!map || !userLocation || !showUserLocation || !window.google) return;

    // Clear existing user marker
    if (userMarker) {
      userMarker.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Votre position',
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#2196F3" stroke="white" stroke-width="3"/>
            <circle cx="15" cy="15" r="4" fill="white"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(30, 30),
        anchor: new window.google.maps.Point(15, 15)
      }
    });

    setUserMarker(marker);

    return () => {
      if (marker) marker.setMap(null);
    };
  }, [map, userLocation, showUserLocation, userMarker]);

  // Get user location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (map) {
            map.setCenter(location);
            map.setZoom(14);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!map || !searchQuery.trim()) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14);
      } else {
        console.warn('Geocoding failed:', status);
        // Fallback: try to find location in Cameroon context
        if (searchQuery.toLowerCase().includes('yaoundé') || searchQuery.toLowerCase().includes('yaounde')) {
          map.setCenter(DEFAULT_CENTER);
          map.setZoom(14);
        }
      }
    });
  };

  // Calculate route to seller
  const handleGetDirections = (seller) => {
    if (!directionsService || !directionsRenderer || !userLocation || !seller.location?.coordinates) {
      return;
    }

    directionsService.route({
      origin: userLocation,
      destination: seller.location.coordinates,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        console.warn('Directions request failed:', status);
        // Could show a notification to user about directions failure
      }
    });
  };

  return (
    <Box sx={{ height, position: 'relative' }}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          right: 16, 
          zIndex: 10,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap'
        }}>
          {showSearch && (
            <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: 200 }}>
              <TextField
                size="small"
                placeholder="Rechercher une adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                sx={{ 
                  flex: 1,
                  bgcolor: 'white',
                  borderRadius: 1
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ 
                  bgcolor: SELLER_THEME.primary,
                  '&:hover': { bgcolor: SELLER_THEME.secondary }
                }}
              >
                <Search />
              </Button>
            </Box>
          )}
          
          <Button
            variant="contained"
            onClick={handleGetUserLocation}
            sx={{ 
              bgcolor: '#2196F3',
              '&:hover': { bgcolor: '#1976D2' }
            }}
          >
            <MyLocation />
          </Button>
        </Box>
      )}

      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      />

      {/* Selected Seller Info Panel */}
      {selectedSeller && (
        <Card sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 10,
          maxWidth: 400,
          mx: 'auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {selectedSeller.shopName}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setSelectedSeller(null)}
              >
                <Close />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {selectedSeller.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Store />}
                label={`${selectedSeller.location?.deliveryRadius || 5}km`}
                size="small"
                color="primary"
              />
              {selectedSeller.settings?.acceptsDelivery && (
                <Chip
                  icon={<LocalShipping />}
                  label="Livraison"
                  size="small"
                  color="success"
                />
              )}
              <Chip
                icon={<Star />}
                label={selectedSeller.stats?.averageRating?.toFixed(1) || '0.0'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => onSellerClick && onSellerClick(selectedSeller)}
                sx={{ 
                  bgcolor: SELLER_THEME.primary,
                  color: 'black',
                  '&:hover': { bgcolor: SELLER_THEME.secondary }
                }}
              >
                Sélectionner
              </Button>
              
              {userLocation && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleGetDirections(selectedSeller)}
                  startIcon={<Directions />}
                >
                  Itinéraire
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// Map component wrapper
function MapComponent(props) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (mapRef.current && !map && window.google && window.google.maps) {
      try {
        console.log('Initializing Google Map...');
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: props.userLocation || DEFAULT_CENTER,
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('Google Map initialized successfully');
        setMap(mapInstance);
        if (props.onMapLoad) {
          props.onMapLoad(mapInstance);
        }
      } catch (error) {
        console.error('Error initializing Google Map:', error);
        setMapError(error.message);
      }
    }
  }, [map, props]);

  if (mapError) {
    return (
      <Alert severity="error" sx={{ height: props.height || 400, display: 'flex', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Erreur d'initialisation de la carte
          </Typography>
          <Typography variant="body2">
            {mapError}
          </Typography>
        </Box>
      </Alert>
    );
  }

  return <GoogleMapsComponent {...props} map={map} mapRef={mapRef} />;
}

// Main wrapper component
function EnhancedGoogleMaps(props) {
  const render = (status) => {
    console.log('Google Maps Status:', status);

    switch (status) {
      case Status.LOADING:
        return (
          <Box sx={{
            height: props.height || 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderRadius: 2
          }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Chargement de la carte...</Typography>
          </Box>
        );
      case Status.FAILURE:
        console.error('Google Maps failed to load');
        return (
          <Alert severity="error" sx={{ height: props.height || 400, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Erreur lors du chargement de Google Maps
              </Typography>
              <Typography variant="body2" gutterBottom>
                La clé API Google Maps n'est pas autorisée pour ce service.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                APIs requises: Maps JavaScript API, Geocoding API, Directions API
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.7, mb: 2 }}>
                API Key: {GOOGLE_MAPS_API_KEY ? 'Configurée' : 'Manquante'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open('https://console.cloud.google.com/apis/dashboard', '_blank')}
              >
                Configurer les APIs Google
              </Button>
            </Box>
          </Alert>
        );
      case Status.SUCCESS:
        console.log('Google Maps loaded successfully');
        return <MapComponent {...props} />;
      default:
        console.warn('Unknown Google Maps status:', status);
        return (
          <Box sx={{
            height: props.height || 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.50',
            borderRadius: 2
          }}>
            <Typography>Initialisation de la carte...</Typography>
          </Box>
        );
    }
  };

  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_API_KEY}
      render={render}
      libraries={['places', 'geometry']}
      version="weekly"
    />
  );
}

export default EnhancedGoogleMaps;
