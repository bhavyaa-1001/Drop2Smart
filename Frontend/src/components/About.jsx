
const About = () => {
  const teamMembers = [
    {
      name: 'Bhavya Bansal',
      role: 'MERN Stack Developer',
      expertise: 'MongoDB, Express.js, React & Node.js',
      image: '👨‍💻',
      contribution: 'Site development '
    },
    {
      name: 'Kshitij',
      role: 'ML Engineer',
      expertise: 'Python, TensorFlow & OpenCV',
      image: '👨‍💻',
      contribution: 'Rainwater harvesting models'
    },
    {
      name: 'Jatin Kumar',
      role: 'UI/UX Designer',
      expertise: 'Figma & Adobe XD',
      image: '👨‍💼',
      contribution: 'Platform architecture'
    },
    {
      name: 'Jiya',
      role: 'Research Analyst',
      expertise: 'Data Analysis & Environmental Studies',
      image: '👩‍💻',
      contribution: 'Sustainability research'
    },
    {
      name: 'Shubham',
      role: 'AI/ML Specialist',
      expertise: 'RAG & NLP',
      image: '👨‍💻',
      contribution: 'AI integration'
    },
    {
      name: 'Shirsha Bansal',
      role: 'Presentation Lead',
      expertise: 'Content Creation & Storytelling',
      image: '👩‍🎨',
      contribution: 'Pitch deck design'
    }
  ];

  const achievements = [
    {
      title: 'Smart India Hackathon 2025',
      description: '',
      icon: '🧠'
    },
    {
      title: '90% Accuracy Rate',
      description: 'AI-powered rooftop analysis',
      icon: '🎯'
    },
    {
      title: '50,000+ Users',
      description: 'Beta testing phase',
      icon: '👥'
    },
    {
      title: 'Pan-India Coverage',
      description: 'Climate data integration',
      icon: '🌍'
    }
  ];

  const techStack = [
    { name: 'React', description: 'Frontend Framework' },
    { name: 'ExpressJs', description: 'Backend Framework' },
    { name: 'TailwindCSS', description: 'Styling & Design' },
    { name: 'Python', description: 'AI/ML Backend' },
    { name: 'PyTorch', description: 'Fine Tunning' },
    { name: 'OpenCV', description: 'Computer Vision' },
    { name: 'LangChain & LangGraph', description: 'RAG' },
    { name: 'Node.js', description: 'API Development' },
    { name: 'MongoDB', description: 'Database' }
  ];

  return (
    <section className="section-padding bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              Smart India Hackathon 2025
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            About Drop2Smart
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Empowering India's water security through AI-driven rainwater harvesting solutions. 
            Built for Smart India Hackathon 2025 with a vision to transform water conservation.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="card-glass mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Drop2Smart aims to revolutionize rainwater harvesting in India by making assessment 
                and implementation accessible, accurate, and efficient. We leverage cutting-edge AI 
                technology to analyze rooftop potential and provide personalized solutions for 
                sustainable water management.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">AI-powered rooftop analysis with 95% accuracy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Comprehensive compliance and monitoring tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Accessible platform for all stakeholders</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">💧</div>
                <div className="text-3xl font-bold text-gradient mb-2">Vision 2030</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Enable 10 million households to adopt rainwater harvesting through intelligent assessment and monitoring
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement, index) => (
            <div key={index} className="card-glass text-center">
              <div className="text-4xl mb-4">{achievement.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A passionate team of engineers, designers, and environmentalists united by the mission 
              to solve India's water challenges through technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="card-glass text-center fle">
                <div className="text-6xl mb-4">{member.image}</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h4>
                <div className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">
                  {member.role}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {member.expertise}
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg">
                  <div className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {member.contribution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="card-glass mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Technology Stack
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built with modern technologies for scalability, performance, and user experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-300">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {tech.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {tech.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIH 2025 Recognition */}
        <div className="card-glass text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">💧</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Drop2Smart
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              Representing 
              innovative solutions for India's water security challenges. Our platform addresses 
              the critical need for intelligent rainwater harvesting systems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                Problem Statement
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                AI-powered assessment and monitoring for rooftop rainwater harvesting systems
              </div>
            </div>
            
            <div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400 mb-2">
                Innovation
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Computer vision analysis with real-time monitoring and compliance tracking
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Impact
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Scalable solution for nationwide water conservation and sustainability
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;