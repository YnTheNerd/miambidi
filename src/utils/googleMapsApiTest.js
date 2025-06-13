/**
 * Google Maps API Test Utility
 * Tests all required APIs and provides detailed diagnostics
 */

const GOOGLE_MAPS_API_KEY = 'AIzaSyDqJtH6hpF1i1ct9qHzKsqHh4wzMwZTzfw';
const TEST_LOCATION = 'Yaoundé, Cameroon';
const TEST_COORDINATES = { lat: 3.8480, lng: 11.5021 };

/**
 * Test Google Maps APIs
 */
export async function testGoogleMapsAPIs() {
  const results = {
    timestamp: new Date().toISOString(),
    apiKey: GOOGLE_MAPS_API_KEY,
    tests: {}
  };

  console.log('🧪 Starting Google Maps API Tests...');

  // Test 1: Geocoding API
  try {
    console.log('📍 Testing Geocoding API...');
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(TEST_LOCATION)}&key=${GOOGLE_MAPS_API_KEY}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    results.tests.geocoding = {
      status: geocodeData.status,
      success: geocodeData.status === 'OK',
      error: geocodeData.error_message || null,
      url: geocodeUrl
    };
    
    if (geocodeData.status === 'OK') {
      console.log('✅ Geocoding API: Working');
    } else {
      console.log('❌ Geocoding API:', geocodeData.status, geocodeData.error_message);
    }
  } catch (error) {
    results.tests.geocoding = {
      status: 'NETWORK_ERROR',
      success: false,
      error: error.message,
      url: null
    };
    console.log('❌ Geocoding API: Network Error -', error.message);
  }

  // Test 2: Maps JavaScript API (check if loaded)
  results.tests.mapsJS = {
    status: (typeof window !== 'undefined' && window.google && window.google.maps) ? 'OK' : 'NOT_LOADED',
    success: (typeof window !== 'undefined' && window.google && window.google.maps),
    error: null,
    url: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
  };

  if (results.tests.mapsJS.success) {
    console.log('✅ Maps JavaScript API: Loaded');
  } else {
    console.log('❌ Maps JavaScript API: Not loaded');
  }

  // Test 3: Directions API (only if Maps JS API is loaded)
  if (results.tests.mapsJS.success && typeof window !== 'undefined') {
    try {
      console.log('🛣️ Testing Directions API...');
      const directionsService = new window.google.maps.DirectionsService();
      
      await new Promise((resolve, reject) => {
        directionsService.route({
          origin: TEST_COORDINATES,
          destination: { lat: 3.8580, lng: 11.5121 }, // Slightly different location
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          results.tests.directions = {
            status: status,
            success: status === 'OK',
            error: status !== 'OK' ? `Directions API returned: ${status}` : null,
            url: null
          };
          
          if (status === 'OK') {
            console.log('✅ Directions API: Working');
          } else {
            console.log('❌ Directions API:', status);
          }
          resolve();
        });
      });
    } catch (error) {
      results.tests.directions = {
        status: 'ERROR',
        success: false,
        error: error.message,
        url: null
      };
      console.log('❌ Directions API: Error -', error.message);
    }
  } else {
    results.tests.directions = {
      status: 'MAPS_NOT_LOADED',
      success: false,
      error: 'Maps JavaScript API not loaded',
      url: null
    };
    console.log('⚠️ Directions API: Cannot test (Maps JS API not loaded)');
  }

  // Test 4: Places API (basic check)
  if (results.tests.mapsJS.success && typeof window !== 'undefined') {
    try {
      console.log('🏪 Testing Places API...');
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      results.tests.places = {
        status: 'AVAILABLE',
        success: true,
        error: null,
        url: null
      };
      console.log('✅ Places API: Available');
    } catch (error) {
      results.tests.places = {
        status: 'ERROR',
        success: false,
        error: error.message,
        url: null
      };
      console.log('❌ Places API: Error -', error.message);
    }
  } else {
    results.tests.places = {
      status: 'MAPS_NOT_LOADED',
      success: false,
      error: 'Maps JavaScript API not loaded',
      url: null
    };
    console.log('⚠️ Places API: Cannot test (Maps JS API not loaded)');
  }

  // Summary
  const totalTests = Object.keys(results.tests).length;
  const passedTests = Object.values(results.tests).filter(test => test.success).length;
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All Google Maps APIs are working correctly!');
  } else {
    console.log('⚠️ Some APIs need configuration. Check the setup guide.');
  }

  return results;
}

/**
 * Generate API configuration instructions
 */
export function generateConfigInstructions(testResults) {
  const failedTests = Object.entries(testResults.tests)
    .filter(([_, test]) => !test.success)
    .map(([name, _]) => name);

  if (failedTests.length === 0) {
    return 'All APIs are working correctly! No configuration needed.';
  }

  const apiNames = {
    geocoding: 'Geocoding API',
    mapsJS: 'Maps JavaScript API',
    directions: 'Directions API',
    places: 'Places API'
  };

  const instructions = [
    '🔧 Configuration Required:',
    '',
    'Failed APIs:',
    ...failedTests.map(test => `- ${apiNames[test] || test}`),
    '',
    'Steps to fix:',
    '1. Go to Google Cloud Console: https://console.cloud.google.com/',
    '2. Navigate to "APIs & Services" > "Dashboard"',
    '3. Click "Enable APIs and Services"',
    '4. Enable the failed APIs listed above',
    '5. Configure API key restrictions if needed',
    '',
    'For detailed instructions, see: GOOGLE_MAPS_SETUP_GUIDE.md'
  ];

  return instructions.join('\n');
}

/**
 * Browser-friendly test function
 */
export function runBrowserTest() {
  if (typeof window === 'undefined') {
    console.log('This function must be run in a browser environment');
    return;
  }

  testGoogleMapsAPIs().then(results => {
    console.log('\n📋 Full Test Results:', results);
    console.log('\n📝 Configuration Instructions:');
    console.log(generateConfigInstructions(results));
  });
}

// Auto-run in browser if this script is loaded directly
if (typeof window !== 'undefined' && window.location && window.location.pathname.includes('maps-test')) {
  // Delay to ensure Google Maps might be loaded
  setTimeout(() => {
    runBrowserTest();
  }, 2000);
}
