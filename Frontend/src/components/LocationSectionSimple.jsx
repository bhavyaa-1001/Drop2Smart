import { useState, useEffect } from 'react';
import { 
  getCurrentLocation, 
  getLocationFromCoordinates, 
  getCoordinatesFromAddress,
  getLocationFromIP,
  getAutomaticLocation,
  areValidCoordinates,
  formatCoordinates,
  findNearestCity,
  getCityInfo
} from '../utils/locationUtils.js';

const LocationSectionSimple = ({ formData, onFormDataChange, onLocationChange }) => {
  const [locationState, setLocationState] = useState({
    isDetecting: false,
    detectionError: null,
    isManualMode: false,
    locationSource: null
  });

  const updateCoordinates = async (lat, lng, reverseGeocode = false) => {
    // Update coordinates in form
    onFormDataChange({
      target: {
        name: 'coordinates',
        value: { lat: lat.toString(), lng: lng.toString() }
      }
    });

    // Reverse geocode to get address if needed
    if (reverseGeocode && !formData.location) {
      try {
        const locationData = await getLocationFromCoordinates(lat, lng);
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
        // Fallback to nearest city lookup
        const nearestCity = findNearestCity(lat, lng);
        if (nearestCity) {
          onFormDataChange({
            target: {
              name: 'location',
              value: `${nearestCity.name}, ${nearestCity.state}, India`
            }
          });
          if (!formData.annualRainfall) {
            onFormDataChange({
              target: {
                name: 'annualRainfall',
                value: nearestCity.avgRainfall.toString()
              }
            });
          }
        }
      }
    }

    // Notify parent component
    if (onLocationChange) {
      onLocationChange({ lat, lng, address: formData.location });
    }
  };

  const handleAutoDetectLocation = async () => {
    setLocationState(prev => ({ ...prev, isDetecting: true, detectionError: null, locationSource: null }));

    try {
      // Use the enhanced automatic location detection
      const locationData = await getAutomaticLocation();
      const { coordinates } = locationData;

      // Update form with detected location
      onFormDataChange({
        target: {
          name: 'location',
          value: locationData.address || 'Detected Location'
        }
      });

      updateCoordinates(coordinates.lat, coordinates.lng);

      // Auto-fill rainfall data if available
      if (locationData.suggestedRainfall && !formData.annualRainfall) {
        onFormDataChange({
          target: {
            name: 'annualRainfall',
            value: locationData.suggestedRainfall.toString()
          }
        });
      }

      // Set location source for user info
      setLocationState(prev => ({ 
        ...prev, 
        locationSource: locationData.source,
        detectionError: null
      }));

    } catch (error) {
      let errorMessage = 'Failed to detect location. ';
      if (error.code === 'GEOLOCATION_DENIED') {
        errorMessage += 'Please enable location access in your browser or try the IP-based detection.';
      } else if (error.code === 'GEOLOCATION_UNAVAILABLE') {
        errorMessage += 'Location services are not available. Trying alternative methods.';
      } else {
        errorMessage += 'Please try again or enter manually.';
      }
      
      setLocationState(prev => ({ ...prev, detectionError: errorMessage }));
    } finally {
      setLocationState(prev => ({ ...prev, isDetecting: false }));
    }
  };

  const handleIPLocation = async () => {
    setLocationState(prev => ({ ...prev, isDetecting: true, detectionError: null }));

    try {
      const locationData = await getLocationFromIP();
      const { coordinates } = locationData;

      // Update form with IP-based location
      onFormDataChange({
        target: {
          name: 'location',
          value: locationData.address
        }
      });

      updateCoordinates(coordinates.lat, coordinates.lng);

      // Auto-fill rainfall data if available
      if (locationData.suggestedRainfall && !formData.annualRainfall) {
        onFormDataChange({
          target: {
            name: 'annualRainfall',
            value: locationData.suggestedRainfall.toString()
          }
        });
      }

      setLocationState(prev => ({ 
        ...prev, 
        locationSource: 'ip',
        detectionError: null
      }));

    } catch (error) {
      setLocationState(prev => ({ 
        ...prev, 
        detectionError: 'IP-based location detection failed. Please enter location manually.' 
      }));
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
      updateCoordinates(lat, lng, true);
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.location.trim()) return;

    setLocationState(prev => ({ ...prev, detectionError: null }));

    try {
      const locationData = await getCoordinatesFromAddress(formData.location);
      const { lat, lng } = locationData.coordinates;

      updateCoordinates(lat, lng);
      setLocationState(prev => ({ ...prev, locationSource: 'address' }));

    } catch (error) {
      // Fallback: try to find similar city names
      const cityNames = Object.values(getCityInfo ? {} : {}).map(city => city.name);
      const searchTerm = formData.location.toLowerCase();
      const matchedCity = cityNames.find(city => 
        city.toLowerCase().includes(searchTerm) || searchTerm.includes(city.toLowerCase())
      );

      if (matchedCity) {
        const cityData = getCityInfo(matchedCity);
        if (cityData) {
          updateCoordinates(cityData.lat, cityData.lon);
          onFormDataChange({
            target: {
              name: 'location',
              value: `${cityData.name}, ${cityData.state}, India`
            }
          });
          if (!formData.annualRainfall) {
            onFormDataChange({
              target: {
                name: 'annualRainfall',
                value: cityData.avgRainfall.toString()
              }
            });
          }
          return;
        }
      }

      setLocationState(prev => ({ 
        ...prev, 
        detectionError: 'Address not found. Please try a different address, use coordinates, or try location detection.' 
      }));
    }
  };

  const getLocationSourceDescription = () => {
    switch (locationState.locationSource) {
      case 'geolocation+maps':
        return 'Location detected using GPS and Google Maps';
      case 'geolocation+database':
        return 'Location detected using GPS and city database';
      case 'ip':
        return 'Location detected using your internet connection';
      case 'address':
        return 'Location found from address search';
      case 'default':
        return 'Using default location (Delhi)';
      default:
        return null;
    }
  };

  return (
    <div className="card-glass">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Location Information
      </h2>
      
      <div className="space-y-6">
        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address/Location
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onFormDataChange}
              placeholder="Enter your building address"
              className="w-full px-4 py-3 pr-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              required
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700 transition-colors"
              title="Search address"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Auto-detect Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleAutoDetectLocation}
            disabled={locationState.isDetecting}
            className="flex items-center justify-center space-x-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
          >
            {locationState.isDetecting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Auto-detect Location</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleIPLocation}
            disabled={locationState.isDetecting}
            className="flex items-center justify-center space-x-2 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 px-4 py-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Use IP Location</span>
          </button>
        </div>

        {/* Location Source Info */}
        {locationState.locationSource && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700 dark:text-green-300">
                {getLocationSourceDescription()}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {locationState.detectionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{locationState.detectionError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coordinates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Coordinates
              </h3>
              <button
                type="button"
                onClick={() => setLocationState(prev => ({ ...prev, isManualMode: !prev.isManualMode }))}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                {locationState.isManualMode ? 'Hide Manual Input' : 'Manual Input'}
              </button>
            </div>

            {locationState.isManualMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates.lat}
                    onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                    placeholder="e.g., 28.7041"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates.lng}
                    onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                    placeholder="e.g., 77.1025"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Display current coordinates */}
            {formData.coordinates.lat && formData.coordinates.lng && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current: {formatCoordinates(
                    parseFloat(formData.coordinates.lat), 
                    parseFloat(formData.coordinates.lng)
                  )}
                </p>
              </div>
            )}

            {/* Annual Rainfall */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Rainfall (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="annualRainfall"
                  value={formData.annualRainfall}
                  onChange={onFormDataChange}
                  placeholder="e.g., 1200"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Auto-filled based on location when available
              </p>
            </div>
          </div>

          {/* Location Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location Preview
            </label>
            <div className="relative h-64 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  
                  {formData.location ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.location}
                      </p>
                      {formData.coordinates.lat && formData.coordinates.lng && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatCoordinates(
                            parseFloat(formData.coordinates.lat), 
                            parseFloat(formData.coordinates.lng)
                          )}
                        </p>
                      )}
                      {formData.annualRainfall && (
                        <p className="text-xs text-primary-600 dark:text-primary-400">
                          Annual Rainfall: {formData.annualRainfall}mm
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Location not set
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Use auto-detect or enter manually
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Multiple location detection methods</span>
              <span>No Google Maps API required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSectionSimple;