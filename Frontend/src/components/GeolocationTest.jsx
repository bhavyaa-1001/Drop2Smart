import { useState } from 'react';
import { getCurrentLocation, getLocationFromIP } from '../utils/locationUtils.js';

const GeolocationTest = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (type, data, error = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [
      ...prev,
      {
        id: Date.now(),
        timestamp,
        type,
        data,
        error,
        success: !error
      }
    ]);
  };

  const testBrowserGeolocation = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Testing browser geolocation...');
      const location = await getCurrentLocation();
      addResult('Browser Geolocation', {
        coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        accuracy: `±${Math.round(location.accuracy)}m`,
        source: location.source,
        timestamp: location.timestamp
      });
    } catch (error) {
      addResult('Browser Geolocation', null, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testIPGeolocation = async () => {
    setIsLoading(true);
    try {
      console.log('🌐 Testing IP-based geolocation...');
      const location = await getLocationFromIP();
      addResult('IP Geolocation', {
        coordinates: `${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}`,
        address: location.address,
        accuracy: location.accuracy,
        source: location.source,
        isInIndia: location.isInIndia ? 'Yes' : 'No'
      });
    } catch (error) {
      addResult('IP Geolocation', null, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testGeolocationSupport = () => {
    const isSupported = 'geolocation' in navigator;
    const isSecureContext = location.protocol === 'https:' || 
                            location.hostname === 'localhost' || 
                            location.hostname === '127.0.0.1';
    
    addResult('Geolocation Support', {
      browserSupport: isSupported ? 'Yes' : 'No',
      secureContext: isSecureContext ? 'Yes (Required for geolocation)' : 'No (HTTPS required)',
      currentProtocol: location.protocol,
      currentHost: location.hostname,
      userAgent: navigator.userAgent.split(' ')[0]
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="card-glass max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        🧪 Geolocation Testing Tool
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Test different location detection methods to see what works in your browser.
      </p>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={testGeolocationSupport}
          className="btn-secondary"
          disabled={isLoading}
        >
          Check Support
        </button>
        
        <button
          onClick={testBrowserGeolocation}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Browser GPS'}
        </button>
        
        <button
          onClick={testIPGeolocation}
          className="btn-secondary"
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test IP Location'}
        </button>
        
        <button
          onClick={clearResults}
          className="btn-outline"
          disabled={isLoading || results.length === 0}
        >
          Clear Results
        </button>
      </div>

      {/* Results Display */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Results:
          </h3>
          
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold ${
                  result.success 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {result.success ? '✅' : '❌'} {result.type}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {result.timestamp}
                </span>
              </div>
              
              {result.success ? (
                <div className="space-y-1">
                  {Object.entries(result.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-medium capitalize text-gray-600 dark:text-gray-400">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {result.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
          💡 Tips for Better Location Detection:
        </h4>
        <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
          <li>• Allow location access when prompted by your browser</li>
          <li>• Make sure GPS/Location Services are enabled on your device</li>
          <li>• For best accuracy, use on HTTPS sites (required for geolocation)</li>
          <li>• If browser GPS fails, IP location provides city-level accuracy</li>
          <li>• Connect to WiFi for better location accuracy</li>
        </ul>
      </div>
    </div>
  );
};

export default GeolocationTest;