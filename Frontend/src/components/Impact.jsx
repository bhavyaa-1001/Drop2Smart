const Impact = () => {
  const benefits = [
    {
      title: 'Water Conservation',
      description: 'Reduce dependency on groundwater and municipal supply by up to 40%',
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c-1.5 4.5-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-4.5-7.5-6-12z" />
        </svg>
      ),
      stats: ['40% Water Savings', '15,000L Monthly', '180,000L Annual']
    },
    {
      title: 'Groundwater Recharge',
      description: 'Replenish aquifers and maintain sustainable water table levels',
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      stats: ['25% Recharge Rate', '500L/hr Infiltration', '12,000L Monthly']
    },
    {
      title: 'Flood Prevention',
      description: 'Reduce urban runoff and mitigate flood risks during monsoon',
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      stats: ['60% Runoff Reduction', '2000L Peak Storage', '85% Flood Mitigation']
    },
    {
      title: 'Carbon Footprint',
      description: 'Reduce energy consumption and carbon emissions from water treatment',
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      stats: ['2.5T CO₂ Saved', '30% Energy Reduction', '₹5,000 Cost Savings']
    }
  ];

  const cityImpact = [
    { city: 'Mumbai', installations: 15000, waterSaved: '2.5B L' },
    { city: 'Delhi', installations: 12000, waterSaved: '1.8B L' },
    { city: 'Bangalore', installations: 8000, waterSaved: '1.2B L' },
    { city: 'Chennai', installations: 6000, waterSaved: '950M L' },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Environmental Impact & Benefits
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how Drop2Smart is transforming water conservation across India, 
            creating sustainable solutions for a water-secure future.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="card-glass text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
              
              <div className="space-y-2">
                {benefit.stats.map((stat, statIndex) => (
                  <div 
                    key={statIndex}
                    className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 px-3 py-2 rounded-lg text-sm font-semibold text-primary-700 dark:text-primary-300"
                  >
                    {stat}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* National Impact Statistics */}
        <div className="card-glass mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              National Impact Statistics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Real-world impact across major Indian cities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {cityImpact.map((city, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-6 rounded-xl mb-4">
                  <h4 className="text-xl font-bold mb-2">{city.city}</h4>
                  <div className="text-3xl font-bold mb-1">{city.installations.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Installations</div>
                </div>
                <div className="text-lg font-semibold text-gradient">
                  {city.waterSaved} Saved
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="card-glass">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Global Water Crisis
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">2 Billion People</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lack access to safely managed drinking water</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">68% of India</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Faces water scarcity challenges</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c-1.5 4.5-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-4.5-7.5-6-12z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">40% Groundwater Depletion</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Critical aquifer stress levels</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Drop2Smart Solution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">AI-Powered Analysis</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">95% accuracy in rooftop assessment</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Smart Monitoring</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Real-time water collection tracking</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Cost Effective</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Up to 60% reduction in water bills</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center card-glass">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Water Conservation Movement
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Be part of India's largest rainwater harvesting network. Start your assessment today 
            and contribute to a sustainable water future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Start Your Assessment
            </button>
            <button className="btn-secondary">
              Learn More About Impact
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;