import { useEffect, useState } from 'react';
import HowItWorks from '../components/HowItWorks';
import Impact from '../components/Impact';
import About from '../components/About';

const WaterRipple = ({ delay = 0, size = 100 }) => {
  return (
    <div
      className={`water-ripple`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        left: `${Math.random() * 80}%`,
        top: `${Math.random() * 80}%`,
      }}
    />
  );
};

const FloatingElement = ({ children, delay = 0 }) => {
  return (
    <div
      className="floating"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

const Landing = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'AI-Powered Rooftop Rainwater Potential';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Water Ripples */}
          {Array.from({ length: 8 }, (_, i) => (
            <WaterRipple key={i} delay={i * 0.5} size={50 + i * 20} />
          ))}
          
          {/* Floating Water Drops */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }, (_, i) => (
              <FloatingElement key={i} delay={i * 0.3}>
                <div
                  className="absolute w-4 h-4 bg-primary-300/20 rounded-full"
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${20 + Math.floor(i / 4) * 30}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-primary-400/30 rounded-full animate-pulse" />
                </div>
              </FloatingElement>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 animate-fade-in">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="block">Drop2Smart</span>
                <span className="block text-gradient mt-2">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Transform your rooftop into a smart water harvesting system. 
                Get AI-powered assessments, compliance insights, and maximize your water savings.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="btn-primary text-lg px-8 py-4">
                Start Assessment
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-6V5a1 1 0 011-1h2a1 1 0 011 1v3M9 7h6" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
              {[
                { number: '50M+', label: 'Liters Saved', icon: '💧' },
                { number: '1000+', label: 'Rooftops Analyzed', icon: '🏠' },
                { number: '95%', label: 'Accuracy Rate', icon: '🎯' }
              ].map((stat, index) => (
                <div key={index} className="card-glass text-center animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* Impact Section */}
      <section id="impact">
        <Impact />
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>
    </div>
  );
};

export default Landing;