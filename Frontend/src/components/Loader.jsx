const Loader = ({ text = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 border-r-secondary-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Water drops animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse opacity-70"></div>
        </div>
      </div>
      
      <div className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
        {text}
      </div>
    </div>
  );
};

export default Loader;