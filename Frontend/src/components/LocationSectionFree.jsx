import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getCurrentLocation, 
  getLocationFromIP,
  getAutomaticLocation,
  areValidCoordinates,
  formatCoordinates,
  findNearestCity,
  getCityInfo
} from '../utils/locationUtils.js';

// Free reverse geocoding using OpenStreetMap Nominatim
const reverseGeocodeWithNominatim = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      // Extract city and state from address components
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.suburb;
      const state = address.state || address.province;
      const country = address.country;
      
      // Get rainfall data if in India
      let suggestedRainfall = null;
      if (country === 'India' && city) {
        const cityData = getCityInfo(city);
        suggestedRainfall = cityData?.avgRainfall;
      }
      
      return {
        address: data.display_name,
        city,
        state,
        country,
        coordinates: { lat, lng },
        suggestedRainfall
      };
    }
    throw new Error('No address found');
  } catch (error) {
    // Fallback to nearest city from our database
    const nearestCity = findNearestCity(lat, lng);
    if (nearestCity) {
      return {
        address: `${nearestCity.name}, ${nearestCity.state}, India`,
        city: nearestCity.name,
        state: nearestCity.state,
        country: 'India',
        coordinates: { lat, lng },
        suggestedRainfall: nearestCity.avgRainfall
      };
    }
    throw error;
  }
};

// Free geocoding using OpenStreetMap Nominatim
const geocodeWithNominatim = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1&addressdetails=1`
    );
    const results = await response.json();
    
    if (results && results.length > 0) {
      const result = results[0];
      const addressData = result.address || {};
      
      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        address: result.display_name,
        city: addressData.city || addressData.town || addressData.village,
        state: addressData.state,
        country: addressData.country
      };
    }
    throw new Error('Address not found');
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

const LocationSectionFree = ({ formData, onFormDataChange, onLocationChange }) => {
  const [locationState, setLocationState] = useState({
    isDetecting: false,
    detectionError: null,
    mapLoaded: false,
    isManualMode: false,
    addressSuggestions: [],
    mapInstance: null
  });
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initializeMap();
        return;
      }

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
      }

      // Load Leaflet JS
      if (!document.querySelector('script[src*="leaflet"]')) {
        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJS.onload = () => {
          initializeMap();
        };
        document.head.appendChild(leafletJS);
      }
    };

    loadLeaflet();
  }, []);

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = [
      parseFloat(formData.coordinates.lat) || 28.7041, 
      parseFloat(formData.coordinates.lng) || 77.1025
    ];

    // Initialize map
    mapInstanceRef.current = window.L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 15,
      scrollWheelZoom: true
    });

    // Add OpenStreetMap tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // Add marker
    const customIcon = window.L.divIcon({
      html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    markerRef.current = window.L.marker(defaultCenter, { 
      draggable: true,
      icon: customIcon
    }).addTo(mapInstanceRef.current);

    // Handle marker drag
    markerRef.current.on('dragend', handleMarkerDrag);
    
    // Handle map click
    mapInstanceRef.current.on('click', handleMapClick);

    setLocationState(prev => ({ ...prev, mapLoaded: true }));
  };

  const handleMarkerDrag = useCallback(() => {
    if (!markerRef.current) return;
    
    const position = markerRef.current.getLatLng();
    updateCoordinates(position.lat, position.lng, true);
  }, []);

  const handleMapClick = useCallback((event) => {
    const { lat, lng } = event.latlng;
    
    // Move marker to clicked position
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    
    updateCoordinates(lat, lng, true);
  }, []);

  const updateCoordinates = async (lat, lng, reverseGeocode = false) => {
    // Update coordinates in form
    onFormDataChange({
      target: {
        name: 'coordinates',
        value: { lat: lat.toString(), lng: lng.toString() }
      }
    });

    // Reverse geocode to get address if needed
    if (reverseGeocode) {
      try {
        const locationData = await reverseGeocodeWithNominatim(lat, lng);
        if (locationData.address) {
          onFormDataChange({
            target: {
              name: 'location',
              value: locationData.address
            }
          });
        }

        // Auto-suggest rainfall data if available
        if (locationData.suggestedRainfall && !formData.annualRainfall) {
          onFormDataChange({
            target: {
              name: 'annualRainfall',
              value: locationData.suggestedRainfall.toString()
            }
          });
        }
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
      }
    }

    // Notify parent component
    if (onLocationChange) {
      onLocationChange({ lat, lng, address: formData.location });
    }
  };

  const handleAutoDetectLocation = async () => {
    setLocationState(prev => ({ ...prev, isDetecting: true, detectionError: null }));

    try {
      // Try browser geolocation first
      const locationData = await getCurrentLocation();
      const { latitude, longitude } = locationData;

      // Update form with detected location
      updateCoordinates(latitude, longitude, true);

      // Center map on detected location
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 16);
        markerRef.current.setLatLng([latitude, longitude]);
      }

    } catch (error) {
      // Fallback to IP-based location
      try {
        const ipLocation = await getLocationFromIP();
        const { lat, lng } = ipLocation.coordinates;

        onFormDataChange({
          target: {
            name: 'location',
            value: ipLocation.address
          }
        });

        updateCoordinates(lat, lng);

        // Center map on IP location
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 12);
          markerRef.current.setLatLng([lat, lng]);
        }

        // Auto-fill rainfall data if available
        if (ipLocation.suggestedRainfall && !formData.annualRainfall) {
          onFormDataChange({
            target: {
              name: 'annualRainfall',
              value: ipLocation.suggestedRainfall.toString()
            }
          });
        }

      } catch (ipError) {
        setLocationState(prev => ({ 
          ...prev, 
          detectionError: 'Location detection failed. Please enter coordinates manually or click on the map.' 
        }));
      }
    } finally {
      setLocationState(prev => ({ ...prev, isDetecting: false }));
    }
  };

  const handleCoordinateChange = (field, value) => {
    const newCoordinates = {
      ...formData.coordinates,
      [field]: value
    };

    onFormDataChange({
      target: {
        name: 'coordinates',
        value: newCoordinates
      }
    });

    // Auto-update location if coordinates become valid
    const lat = parseFloat(newCoordinates.lat);
    const lng = parseFloat(newCoordinates.lng);
    
    if (areValidCoordinates(lat, lng)) {
      // Update map position
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([lat, lng], 15);
        markerRef.current.setLatLng([lat, lng]);
      }
      
      updateCoordinates(lat, lng, true);
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.location.trim()) return;

    try {
      setLocationState(prev => ({ ...prev, detectionError: null }));
      const locationData = await geocodeWithNominatim(formData.location);
      const { lat, lng } = locationData.coordinates;

      updateCoordinates(lat, lng);

      // Update map view
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }

    } catch (error) {
      setLocationState(prev => ({ 
        ...prev, 
        detectionError: `Address not found: ${error.message}` 
      }));
    }
  };

  return (
    <div className="card-glass">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        📍 Location Information
      </h2>
      <p className="text-sm text-green-600 dark:text-green-400 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        ✨ <strong>100% Free Location Services!</strong> Using browser geolocation, IP detection, and OpenStreetMap.
      </p>

      <div className="space-y-6">
        {/* Auto-detect Location */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleAutoDetectLocation}
            disabled={locationState.isDetecting}
            className="btn-secondary flex-1 flex items-center justify-center"
          >
            {locationState.isDetecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Detecting Location...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Auto-Detect Location
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {locationState.detectionError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {locationState.detectionError}
            </p>
          </div>
        )}

        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address or Location Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onFormDataChange}
              placeholder="Enter your address or location name"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors duration-300"
              title="Search Address"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Manual Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.coordinates.lat}
              onChange={(e) => handleCoordinateChange('lat', e.target.value)}
              placeholder="e.g., 28.7041"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.coordinates.lng}
              onChange={(e) => handleCoordinateChange('lng', e.target.value)}
              placeholder="e.g., 77.1025"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Coordinates Display */}
        {areValidCoordinates(parseFloat(formData.coordinates.lat), parseFloat(formData.coordinates.lng)) && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              📍 <strong>Current Coordinates:</strong> {formatCoordinates(
                parseFloat(formData.coordinates.lat), 
                parseFloat(formData.coordinates.lng)
              )}
            </p>
          </div>
        )}

        {/* Interactive Map */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interactive Map (Click or drag to set location)
          </label>
          <div 
            ref={mapRef}
            className="w-full h-64 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
            style={{ minHeight: '256px' }}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            🗺️ Powered by OpenStreetMap (completely free) • Click anywhere to set your location
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSectionFree;