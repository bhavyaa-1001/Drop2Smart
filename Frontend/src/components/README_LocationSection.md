# Enhanced Location Section

This enhanced Location Information section provides comprehensive location services including auto-detection, manual coordinate input, and interactive Google Maps integration with drag-and-drop functionality.

## Features

### ✅ **Auto-Detection**
- **GPS Location**: Automatically detect user's current location using browser geolocation API
- **Address Resolution**: Convert coordinates to human-readable addresses using reverse geocoding
- **Rainfall Data**: Auto-suggest rainfall data based on detected location

### ✅ **Manual Input Options**
- **Address Search**: Type and search addresses with Google Places autocomplete
- **Coordinate Input**: Manually enter latitude and longitude values
- **Search Button**: Convert addresses to coordinates using geocoding

### ✅ **Interactive Google Maps**
- **Drag & Drop Marker**: Drag the marker to select precise location
- **Click to Select**: Click anywhere on the map to set location
- **Satellite View**: Hybrid map view for better rooftop visibility
- **Real-time Updates**: Map and coordinates sync automatically

### ✅ **Smart Features**
- **Auto-fill Rainfall**: Suggests rainfall data for Indian cities
- **Coordinate Validation**: Validates coordinates and India bounds checking
- **Error Handling**: User-friendly error messages and fallback options
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Google Maps API Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** 
   - **Geocoding API**

4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the API key to your domain for production
   - Copy the API key

5. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env file and add your API key
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 2. Component Installation

The enhanced location section is already integrated into your Assessment page. You can use either:

- **`LocationSection`**: Full Google Maps integration (requires API key)
- **`LocationSectionFallback`**: Works without Google Maps (auto-detect + manual input only)

To switch between versions, edit `Assessment.jsx`:

```javascript
// For full Google Maps integration
import LocationSection from '../components/LocationSection';

// For fallback version (no Google Maps)
import LocationSection from '../components/LocationSectionFallback';
```

### 3. Usage in Assessment Form

```javascript
<LocationSection 
  formData={formData}
  onFormDataChange={handleInputChange}
  onLocationChange={handleLocationChange}
/>
```

## Component Props

| Prop | Type | Description |
|------|------|-------------|
| `formData` | Object | Form data containing location, coordinates, and annualRainfall |
| `onFormDataChange` | Function | Handler for form input changes |
| `onLocationChange` | Function | Optional callback when location is updated |

### FormData Structure
```javascript
{
  location: '',              // Address string
  coordinates: {             // Coordinate object
    lat: '',                 // Latitude as string
    lng: ''                  // Longitude as string  
  },
  annualRainfall: ''         // Annual rainfall in mm
}
```

## User Interactions

### Auto-Detection Flow
1. User clicks "Auto-detect Location" button
2. Browser prompts for location permission
3. GPS coordinates are obtained
4. Address is resolved via reverse geocoding
5. Map centers on detected location
6. Rainfall data is auto-suggested if available

### Manual Address Entry
1. User types address in input field
2. Google Places provides autocomplete suggestions
3. User selects address or clicks search button
4. Address is geocoded to coordinates
5. Map updates to show selected location

### Map Interaction
1. User clicks on map or drags marker
2. Coordinates are updated in real-time
3. Address is reverse-geocoded (optional)
4. Form fields are automatically updated

### Manual Coordinate Entry
1. User clicks "Manual Input" to show coordinate fields
2. User enters latitude and longitude values
3. Map updates to show entered coordinates
4. Coordinate validation ensures valid values

## Error Handling

The component handles various error scenarios gracefully:

- **Location Permission Denied**: Shows user-friendly message with manual alternatives
- **Network Issues**: Fallback to manual input with clear error messages
- **Invalid Addresses**: Provides suggestions to try different formats
- **Invalid Coordinates**: Real-time validation with helpful feedback
- **API Failures**: Graceful degradation to basic functionality

## Responsive Design

The component is fully responsive:
- **Desktop**: Side-by-side layout with map and controls
- **Mobile**: Stacked layout with touch-friendly interactions
- **Tablet**: Adaptive layout that works in both orientations

## Customization

### Styling
The component uses Tailwind CSS classes and follows your app's design system:
- Dark mode support
- Consistent with existing card-glass styling
- Primary color theming
- Smooth animations and transitions

### Configuration
You can customize various aspects:

```javascript
// Map configuration
const mapOptions = {
  center: defaultCenter,
  zoom: 15,
  mapTypeId: 'hybrid',      // 'roadmap', 'satellite', 'hybrid', 'terrain'
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
};

// Autocomplete restrictions
const autocompleteOptions = {
  types: ['address'],
  componentRestrictions: { country: 'in' }, // Restrict to India
};
```

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check if Google Maps API key is set correctly
   - Verify APIs are enabled in Google Cloud Console
   - Check browser console for API errors

2. **Location detection failing**
   - Ensure HTTPS is enabled (required for geolocation)
   - Check browser location permissions
   - Try manual input as fallback

3. **Address search not working**
   - Verify Places API is enabled
   - Check API key restrictions
   - Use fallback LocationSectionFallback component

4. **Coordinates not updating**
   - Check if onFormDataChange handler is working
   - Verify formData structure matches expected format
   - Check console for JavaScript errors

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Android Chrome
- **Geolocation**: Requires HTTPS for location services
- **Maps**: Requires JavaScript enabled

## Security Considerations

1. **API Key Security**:
   - Restrict API key to your domain in production
   - Don't commit API keys to version control
   - Use environment variables

2. **Location Privacy**:
   - Always ask for user permission
   - Provide clear information about location usage
   - Allow users to opt-out of location services

## Performance Optimization

- **Lazy Loading**: Maps API is loaded only when needed
- **Debouncing**: Address search and coordinate updates are debounced
- **Caching**: Location data is cached to reduce API calls
- **Error Recovery**: Graceful fallbacks prevent app crashes

## Future Enhancements

Potential improvements you could add:
- **Offline Maps**: Cache map tiles for offline usage
- **Location History**: Remember previously used locations
- **Address Validation**: Enhanced address format validation
- **Custom Markers**: Custom marker designs for better branding
- **Map Themes**: Multiple map style options
- **Radius Selection**: Allow users to select area radius around location