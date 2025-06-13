/**
 * Smart Map Wrapper Component
 * Automatically chooses between Google Maps and Fallback Map based on availability
 */

import React, { useState, useEffect } from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import EnhancedGoogleMaps from './GoogleMapsComponent';
import FallbackMap from './FallbackMap';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDqJtH6hpF1i1ct9qHzKsqHh4wzMwZTzfw';

function SmartMapWrapper(props) {
  const [mapMode, setMapMode] = useState('loading'); // 'loading', 'google', 'fallback', 'error'
  const [apiStatus, setApiStatus] = useState(null);

  // Test Google Maps API availability
  useEffect(() => {
    const testGoogleMapsAPI = async () => {
      try {
        // Test if we can load the basic Maps JavaScript API
        const testUrl = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap`;
        
        // Create a test script element
        const script = document.createElement('script');
        script.src = testUrl;
        script.async = true;
        script.defer = true;
        
        // Set up a global callback for testing
        window.initMap = () => {
          console.log('✅ Google Maps API loaded successfully');
          setMapMode('google');
          setApiStatus('success');
          // Clean up
          delete window.initMap;
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
        
        script.onerror = (error) => {
          console.error('❌ Google Maps API failed to load:', error);
          setMapMode('fallback');
          setApiStatus('failed');
          // Clean up
          delete window.initMap;
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
        
        // Timeout fallback
        const timeout = setTimeout(() => {
          console.warn('⚠️ Google Maps API loading timeout, using fallback');
          setMapMode('fallback');
          setApiStatus('timeout');
          // Clean up
          delete window.initMap;
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        }, 10000); // 10 second timeout
        
        // Add script to head
        document.head.appendChild(script);
        
        // Clean up timeout if successful
        script.onload = () => {
          clearTimeout(timeout);
        };
        
      } catch (error) {
        console.error('❌ Error testing Google Maps API:', error);
        setMapMode('fallback');
        setApiStatus('error');
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already loaded');
      setMapMode('google');
      setApiStatus('already-loaded');
    } else {
      testGoogleMapsAPI();
    }
  }, []);

  const handleForceGoogleMaps = () => {
    setMapMode('loading');
    // Force reload the page to try Google Maps again
    window.location.reload();
  };

  const handleUseFallback = () => {
    setMapMode('fallback');
  };

  if (mapMode === 'loading') {
    return (
      <Box sx={{ 
        height: props.height || 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'grey.50',
        borderRadius: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Chargement de la carte...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Test de l'API Google Maps en cours
          </Typography>
        </Box>
      </Box>
    );
  }

  if (mapMode === 'google') {
    return (
      <Box sx={{ position: 'relative' }}>
        <EnhancedGoogleMaps {...props} />
        
        {/* Option to switch to fallback */}
        <Button
          variant="text"
          size="small"
          onClick={handleUseFallback}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1000,
            bgcolor: 'rgba(255,255,255,0.9)',
            fontSize: '0.7rem',
            minWidth: 'auto',
            px: 1
          }}
        >
          Mode simple
        </Button>
      </Box>
    );
  }

  if (mapMode === 'fallback') {
    return (
      <Box sx={{ position: 'relative' }}>
        <FallbackMap {...props} />
        
        {/* Option to try Google Maps again */}
        <Box sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}>
          <Button
            variant="text"
            size="small"
            onClick={handleForceGoogleMaps}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              fontSize: '0.7rem',
              minWidth: 'auto',
              px: 1
            }}
          >
            Réessayer Google Maps
          </Button>
        </Box>
      </Box>
    );
  }

  // Error state
  return (
    <Alert severity="error" sx={{ height: props.height || 400, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Erreur de chargement de la carte
        </Typography>
        <Typography variant="body2" gutterBottom>
          Impossible de charger Google Maps ou le mode de secours.
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8rem', opacity: 0.7 }}>
          Status: {apiStatus}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={handleUseFallback}>
            Mode simple
          </Button>
          <Button variant="contained" size="small" onClick={handleForceGoogleMaps}>
            Réessayer
          </Button>
        </Box>
      </Box>
    </Alert>
  );
}

export default SmartMapWrapper;
