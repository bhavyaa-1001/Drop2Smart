const StepCard = ({ step, title, description, icon, delay = 0 }) => {
  return (
    <div 
      className="card-glass text-center animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 shadow-md">
          {step}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
      
      {/* Connecting Arrow (except for last step) */}
      {step < 5 && (
        <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2">
          <svg className="w-8 h-8 text-primary-300 dark:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      )}
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      title: 'Upload Roof Image',
      description: 'Simply drag and drop or upload a photo of your rooftop. Our AI analyzes the structure, materials, and dimensions.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      )
    },
    {
      title: 'Analyze Structure',
      description: 'Advanced computer vision identifies roof type, slope, drainage patterns, and optimal harvesting zones.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: 'Calculate Runoff',
      description: 'Precise calculations considering rainfall data, roof area, slope coefficient, and local climate patterns.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Suggest Systems',
      description: 'Receive customized recommendations for tanks, filters, and recharge structures based on your needs and budget.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      title: 'Monitor Savings',
      description: 'Track your water savings, compliance status, and environmental impact with real-time monitoring dashboards.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <section className="section-padding bg-white/50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            How Drop2Smart Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our AI-powered platform makes rainwater harvesting assessment simple and accurate. 
            Follow these five easy steps to unlock your rooftop's water potential.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <StepCard
                step={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                delay={index * 0.2}
              />
            </div>
          ))}
        </div>

        {/* Process Flow Visualization */}
        <div className="mt-16 p-8 card-glass">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Process Flow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              From upload to monitoring - see how your data flows through our intelligent system
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            {['Image Upload', 'AI Analysis', 'Data Processing', 'Report Generation', 'Monitoring'].map((process, index) => (
              <div key={index} className="flex items-center">
                <div className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-medium">
                  {process}
                </div>
                {index < 4 && (
                  <svg className="w-6 h-6 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;