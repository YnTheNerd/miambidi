# Google Maps API Configuration Guide for MiamBidi

## Current Issue
The Google Maps integration in MiamBidi is not working because the API key `AIzaSyDqJtH6hpF1i1ct9qHzKsqHh4wzMwZTzfw` is not authorized for the required Google Maps APIs.

## Error Message
```
"This API key is not authorized to use this service or API."
Status: "REQUEST_DENIED"
```

## Required Google Maps APIs

The MiamBidi application requires the following APIs to be enabled:

### 1. Maps JavaScript API ✅ (Required for basic map display)
- **Purpose**: Display interactive maps
- **Used in**: All map components
- **Status**: Likely enabled (maps load but fail on other services)

### 2. Geocoding API ❌ (Currently disabled)
- **Purpose**: Convert addresses to coordinates and vice versa
- **Used in**: Address search functionality
- **Code location**: `GoogleMapsComponent.jsx` line 229-244

### 3. Directions API ❌ (Currently disabled)
- **Purpose**: Calculate routes between locations
- **Used in**: Route calculation to sellers
- **Code location**: `GoogleMapsComponent.jsx` line 247-264

### 4. Places API (Optional)
- **Purpose**: Enhanced location search and autocomplete
- **Used in**: Advanced search features
- **Status**: Loaded in libraries but not actively used

## Step-by-Step Fix Instructions

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Dashboard"

### Step 2: Enable Required APIs
1. Click "Enable APIs and Services"
2. Search for and enable each of these APIs:
   - **Maps JavaScript API**
   - **Geocoding API** 
   - **Directions API**
   - **Places API** (optional but recommended)

### Step 3: Configure API Key Restrictions (Recommended)
1. Go to "APIs & Services" > "Credentials"
2. Find your API key: `AIzaSyDqJtH6hpF1i1ct9qHzKsqHh4wzMwZTzfw`
3. Click "Edit" (pencil icon)
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled above
5. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `http://localhost:*` (for development)
     - `https://yourdomain.com/*` (for production)

### Step 4: Test the Configuration
1. Navigate to `/maps-test` in your application
2. Click "Test All APIs" button
3. Verify all APIs return ✅ status

## Fallback Solution Implemented

While you configure the APIs, the application now includes a fallback system:

### SmartMapWrapper Component
- **Location**: `src/components/maps/SmartMapWrapper.jsx`
- **Purpose**: Automatically detects Google Maps availability
- **Fallback**: Uses `FallbackMap.jsx` when Google Maps fails

### FallbackMap Component
- **Location**: `src/components/maps/FallbackMap.jsx`
- **Purpose**: Provides seller list view when maps are unavailable
- **Features**: 
  - Seller list with distance calculation
  - Contact buttons (phone, directions)
  - Selection functionality

## Updated Components

The following components now use `SmartMapWrapper` instead of direct Google Maps:

1. **SellerDiscovery** (`src/components/shopping/SellerDiscovery.jsx`)
2. **SellerRegistration** (`src/components/seller/SellerRegistration.jsx`)

## Testing Components

### GoogleMapsTest Component
- **URL**: `/maps-test` (development only)
- **Purpose**: Comprehensive API testing
- **Features**:
  - Tests all required APIs
  - Shows detailed error messages
  - Provides links to Google Cloud Console

## Cost Considerations

### Free Tier Limits (per month)
- **Maps JavaScript API**: 28,000 loads
- **Geocoding API**: 40,000 requests  
- **Directions API**: 40,000 requests
- **Places API**: 17,000 requests

### Estimated Usage for MiamBidi
- **Maps loads**: ~1,000-5,000/month (seller discovery, registration)
- **Geocoding**: ~500-2,000/month (address searches)
- **Directions**: ~200-1,000/month (route calculations)

**Expected cost**: $0-10/month for typical usage

## Security Best Practices

1. **API Key Restrictions**: Always restrict by domain and API
2. **Environment Variables**: Store API key in environment variables (not hardcoded)
3. **Monitoring**: Set up billing alerts in Google Cloud Console
4. **Rate Limiting**: Implement client-side rate limiting for API calls

## Troubleshooting

### Common Issues
1. **"REQUEST_DENIED"**: API not enabled or key restrictions too strict
2. **"OVER_QUERY_LIMIT"**: Exceeded free tier limits
3. **"INVALID_REQUEST"**: Malformed API request
4. **Loading timeout**: Network issues or API key problems

### Debug Steps
1. Check browser console for detailed error messages
2. Use `/maps-test` page for comprehensive testing
3. Verify API key in Google Cloud Console
4. Check billing account is active

## Next Steps

1. **Immediate**: Enable the required APIs in Google Cloud Console
2. **Short-term**: Test all functionality with real API access
3. **Long-term**: Consider implementing caching to reduce API calls
4. **Production**: Set up proper domain restrictions and monitoring

## Contact Information

If you need help with Google Cloud Console configuration, the APIs should be enabled by someone with admin access to the Google Cloud project associated with this API key.
