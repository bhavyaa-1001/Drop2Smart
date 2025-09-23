import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, image } = location.state || {};
  const [activeTab, setActiveTab] = useState('analysis');

  // Dummy calculated data based on form inputs
  const results = {
    annualRainwaterPotential: formData?.roofArea ? Math.round((formData.roofArea * 0.623 * (formData.annualRainfall || 1200)) / 1000) : 850,
    monthlyAverage: formData?.roofArea ? Math.round(((formData.roofArea * 0.623 * (formData.annualRainfall || 1200)) / 1000) / 12) : 71,
    costSavings: formData?.roofArea ? Math.round((formData.roofArea * 0.623 * (formData.annualRainfall || 1200)) / 1000 * 0.5) : 425,
    co2Reduction: formData?.roofArea ? Math.round((formData.roofArea * 0.623 * (formData.annualRainfall || 1200)) / 1000 * 0.002) : 1.7,
    roofEfficiency: 85,
    complianceScore: 92
  };

  // Detailed assessment data matching the white background image
  const detailedAssessment = {
    locationInfo: {
      latitude: formData?.coordinates?.lat || '28.7223752879827557',
      longitude: formData?.coordinates?.lng || '77.0659870043089551'
    },
    soilProperties: {
      soilTexture: 'CLAY LOAM',
      organicCarbon: '1.38%',
      clayContent: '27.7%',
      siltContent: '37.7%',
      sandContent: '34.7%'
    },
    hydraulicProperties: {
      saturatedHydraulicConductivity: '10.75 mm/hr'
    },
    runoffAssessment: {
      runoffCoefficient: '0.34'
    },
    interpretation: {
      title: 'MODERATE RUNOFF POTENTIAL',
      description: 'This area has average water infiltration. Some rainfall will become surface runoff during moderate to heavy precipitation events.'
    }
  };

  const recommendations = [
    {
      type: 'Storage Tank',
      capacity: `${Math.round(results.annualRainwaterPotential * 0.15)}L`,
      cost: `₹${Math.round(results.annualRainwaterPotential * 0.15 * 2.5).toLocaleString()}`,
      description: 'Underground concrete tank with first-flush diverter'
    },
    {
      type: 'Filtration System',
      capacity: 'Multi-stage',
      cost: `₹${(25000).toLocaleString()}`,
      description: 'Sand filter + Carbon filter + UV sterilization'
    },
    {
      type: 'Recharge Structure',
      capacity: '500L/hr',
      cost: `₹${(15000).toLocaleString()}`,
      description: 'Percolation pit with gravel layers'
    }
  ];

  const monthlyData = [
    { month: 'Jan', collection: 45, usage: 40 },
    { month: 'Feb', collection: 38, usage: 35 },
    { month: 'Mar', collection: 52, usage: 48 },
    { month: 'Apr', collection: 28, usage: 25 },
    { month: 'May', collection: 15, usage: 18 },
    { month: 'Jun', collection: 95, usage: 85 },
    { month: 'Jul', collection: 125, usage: 110 },
    { month: 'Aug', collection: 135, usage: 120 },
    { month: 'Sep', collection: 88, usage: 82 },
    { month: 'Oct', collection: 65, usage: 60 },
    { month: 'Nov', collection: 42, usage: 38 },
    { month: 'Dec', collection: 48, usage: 45 }
  ];

  if (!formData) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No assessment data found
          </h1>
          <button 
            onClick={() => navigate('/assessment')}
            className="btn-primary"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rainwater Harvesting Assessment Report
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Analysis for {formData.location}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-1.5 4.5-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-4.5-7.5-6-12z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              {results.annualRainwaterPotential.toLocaleString()}L
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Annual Rainwater Potential
            </p>
          </div>

          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              ₹{results.costSavings.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Annual Cost Savings
            </p>
          </div>

          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              {results.co2Reduction}T
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              CO₂ Reduction/Year
            </p>
          </div>

          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              {results.complianceScore}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Compliance Score
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="glass rounded-lg p-2">
            {[
              { id: 'analysis', name: 'Assessment Results' },
              { id: 'overview', name: 'Overview' },
              { id: 'detailed-analysis', name: 'Detailed Analysis' },
              { id: 'recommendations', name: 'Recommendations' },
              { id: 'monitoring', name: 'Monitoring' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Assessment Results Section */}
        {activeTab === 'analysis' && (
          <div className="card-glass bg-white dark:bg-gray-800 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Location Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Location Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Latitude</div>
                      <div className="text-lg font-mono text-gray-900 dark:text-white">
                        {detailedAssessment.locationInfo.latitude}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Longitude</div>
                      <div className="text-lg font-mono text-gray-900 dark:text-white">
                        {detailedAssessment.locationInfo.longitude}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hydraulic Properties */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Hydraulic Properties
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Saturated Hydraulic Conductivity (Ksat)
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {detailedAssessment.hydraulicProperties.saturatedHydraulicConductivity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Properties */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Soil Properties
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Soil Texture</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Organic Carbon</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Clay Content</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Silt Content</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Sand Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                          {detailedAssessment.soilProperties.soilTexture}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {detailedAssessment.soilProperties.organicCarbon}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {detailedAssessment.soilProperties.clayContent}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {detailedAssessment.soilProperties.siltContent}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {detailedAssessment.soilProperties.sandContent}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Runoff Assessment */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Runoff Assessment
                  </h3>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Runoff Coefficient
                    </div>
                    <div className="text-6xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                      {detailedAssessment.runoffAssessment.runoffCoefficient}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Interpretation
                    </h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
                      <div className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                        {detailedAssessment.interpretation.title}
                      </div>
                      <div className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                        {detailedAssessment.interpretation.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue to Assessment Results Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 text-center">
              <button 
                onClick={() => setActiveTab('overview')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300 inline-flex items-center"
              >
                Continue to Assessment Results
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Roof Analysis */}
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Roof Analysis
                </h3>
                {image && (
                  <div className="mb-6">
                    <img 
                      src={image} 
                      alt="Analyzed rooftop" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      AI-analyzed rooftop structure
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Area</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formData.roofArea} sq ft
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Slope</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formData.roofSlope}°
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Material</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {formData.roofMaterial}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
                    <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {results.roofEfficiency}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Collection Chart */}
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Monthly Water Collection Forecast
                </h3>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">
                      Interactive Chart Placeholder
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Monthly collection vs usage data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="card-glass">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {rec.type}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cost</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {rec.cost}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{rec.capacity}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'detailed-analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Rainfall Analysis
                </h3>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">Rainfall Pattern Chart</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Peak Season</div>
                    <div className="font-semibold text-gray-900 dark:text-white">Jul-Sep</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Dry Season</div>
                    <div className="font-semibold text-gray-900 dark:text-white">Apr-May</div>
                  </div>
                </div>
              </div>

              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Collection Efficiency
                </h3>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">Efficiency Breakdown</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Collection Rate:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">First Flush Loss:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Evaporation Loss:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">10%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="card-glass">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Monitoring Dashboard Preview
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">
                        Real-time Collection Monitoring
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Live data visualization
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">System Status</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">Active</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Today's Collection</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">145L</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Tank Level</div>
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">78%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <button className="btn-primary">
            Download Report (PDF)
            <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button 
            onClick={() => navigate('/assessment')}
            className="btn-secondary"
          >
            New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;