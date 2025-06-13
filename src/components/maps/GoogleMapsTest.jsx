/**
 * Simple Google Maps Test Component
 * Used to debug Google Maps API issues
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDqJtH6hpF1i1ct9qHzKsqHh4wzMwZTzfw';
const DEFAULT_CENTER = { lat: 3.8480, lng: 11.5021 }; // Yaoundé, Cameroon

function GoogleMapsTest() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps API is loaded');
        setApiLoaded(true);
        setLoading(false);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) return;

    // Load Google Maps API if not loaded
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('📍 Google Maps script loaded');
      if (checkGoogleMaps()) {
        console.log('✅ Google Maps API ready');
      } else {
        setError('Google Maps API failed to initialize after script load');
        setLoading(false);
      }
    };
    
    script.onerror = (e) => {
      console.error('❌ Failed to load Google Maps script:', e);
      setError('Failed to load Google Maps script. Check your API key and internet connection.');
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map when API is ready
  useEffect(() => {
    if (apiLoaded && mapRef.current && !map) {
      try {
        console.log('🗺️ Initializing map...');
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: 12,
          mapTypeId: 'roadmap'
        });

        // Add a marker
        new window.google.maps.Marker({
          position: DEFAULT_CENTER,
          map: mapInstance,
          title: 'Yaoundé, Cameroon'
        });

        setMap(mapInstance);
        console.log('✅ Map initialized successfully');
      } catch (err) {
        console.error('❌ Error initializing map:', err);
        setError(`Map initialization error: ${err.message}`);
      }
    }
  }, [apiLoaded, map]);

  const testApiKey = async () => {
    const results = {
      geocoding: null,
      mapsJS: null,
      directions: null
    };

    // Test Geocoding API
    try {
      const geocodeResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Yaoundé&key=${GOOGLE_MAPS_API_KEY}`);
      const geocodeData = await geocodeResponse.json();
      results.geocoding = {
        status: geocodeData.status,
        error: geocodeData.error_message,
        success: geocodeData.status === 'OK'
      };
    } catch (err) {
      results.geocoding = {
        status: 'NETWORK_ERROR',
        error: err.message,
        success: false
      };
    }

    // Test Maps JavaScript API (already loaded if we're here)
    results.mapsJS = {
      status: window.google && window.google.maps ? 'OK' : 'NOT_LOADED',
      success: !!(window.google && window.google.maps)
    };

    // Test Directions API
    if (window.google && window.google.maps) {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route({
          origin: DEFAULT_CENTER,
          destination: { lat: 3.8580, lng: 11.5121 }, // Slightly different location
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          results.directions = {
            status: status,
            success: status === 'OK'
          };

          // Show comprehensive results
          showTestResults(results);
        });
      } catch (err) {
        results.directions = {
          status: 'ERROR',
          error: err.message,
          success: false
        };
        showTestResults(results);
      }
    } else {
      results.directions = {
        status: 'MAPS_NOT_LOADED',
        success: false
      };
      showTestResults(results);
    }
  };

  const showTestResults = (results) => {
    const messages = [
      `🗺️ Maps JavaScript API: ${results.mapsJS.success ? '✅ OK' : '❌ ' + results.mapsJS.status}`,
      `📍 Geocoding API: ${results.geocoding.success ? '✅ OK' : '❌ ' + results.geocoding.status}${results.geocoding.error ? ' - ' + results.geocoding.error : ''}`,
      `🛣️ Directions API: ${results.directions.success ? '✅ OK' : '❌ ' + results.directions.status}${results.directions.error ? ' - ' + results.directions.error : ''}`
    ];

    const summary = messages.join('\n');
    console.log('API Test Results:', results);
    alert(`API Test Results:\n\n${summary}\n\nRequired APIs:\n- Maps JavaScript API\n- Geocoding API\n- Directions API\n\nEnable these in Google Cloud Console.`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Google Maps API...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Google Maps Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button variant="contained" onClick={testApiKey}>
          Test API Key
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Google Maps Test & Diagnostics
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>API Key:</strong> {GOOGLE_MAPS_API_KEY}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Required APIs:</strong> Maps JavaScript API, Geocoding API, Directions API
        </Typography>
        <Typography variant="body2">
          <strong>Test Location:</strong> Yaoundé, Cameroon ({DEFAULT_CENTER.lat}, {DEFAULT_CENTER.lng})
        </Typography>
      </Alert>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={testApiKey}>
          Test All APIs
        </Button>
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>
          API Status: {apiLoaded ? '✅ Loaded' : '❌ Not Loaded'}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.open('https://console.cloud.google.com/apis/dashboard', '_blank')}
        >
          Google Cloud Console
        </Button>
      </Box>

      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: 400,
          border: '1px solid #ccc',
          borderRadius: 1,
          mb: 2
        }}
      />

      {map && (
        <Alert severity="success">
          <Typography variant="body2">
            ✅ Map initialized successfully! You can see Yaoundé, Cameroon with a marker.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Error Details:</strong> {error}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

export default GoogleMapsTest;
