#!/usr/bin/env node

/**
 * Environment Setup Script for Drop2Smart
 * Helps users set up their Google Maps API key safely
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envFilePath = path.join(__dirname, '.env');
const exampleEnvPath = path.join(__dirname, '.env.example');

console.log('🗺️  Drop2Smart - Google Maps API Setup\n');

// Check if .env already exists
if (fs.existsSync(envFilePath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupApiKey();
    } else {
      console.log('❌ Setup cancelled. Your existing .env file is unchanged.');
      rl.close();
    }
  });
} else {
  setupApiKey();
}

function setupApiKey() {
  console.log('\n📋 Please follow these steps to get your FREE Google Maps API key:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Enable: Maps JavaScript API, Places API, Geocoding API');
  console.log('4. Create credentials > API Key');
  console.log('5. Copy your API key\n');
  
  rl.question('Enter your Google Maps API key (or press Enter to skip): ', (apiKey) => {
    let envContent = '';
    
    if (apiKey.trim()) {
      // Validate API key format (basic check)
      if (apiKey.length < 30 || !apiKey.startsWith('AIza')) {
        console.log('⚠️  Warning: This doesn\'t look like a valid Google Maps API key.');
        console.log('   Google Maps API keys usually start with "AIza" and are 39+ characters long.');
      }
      
      envContent = `# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=${apiKey.trim()}

# Other environment variables
# Add more variables here as needed
`;
      
      console.log('✅ API key configured!');
    } else {
      envContent = `# Google Maps API Configuration
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Other environment variables
# Add more variables here as needed
`;
      
      console.log('ℹ️  Skipped API key setup. You can add it later to the .env file.');
    }
    
    // Write .env file
    try {
      fs.writeFileSync(envFilePath, envContent);
      console.log('📁 Created .env file successfully!');
      
      // Also create .env.example if it doesn't exist
      if (!fs.existsSync(exampleEnvPath)) {
        const exampleContent = `# Google Maps API Configuration
# Get your free API key from: https://console.cloud.google.com/
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Other environment variables
# Add more variables here as needed
`;
        fs.writeFileSync(exampleEnvPath, exampleContent);
        console.log('📄 Created .env.example file for reference.');
      }
      
    } catch (error) {
      console.error('❌ Error creating .env file:', error.message);
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Your app will automatically use fallback location features if no API key is provided');
    console.log('3. Add a valid API key later to enable full Google Maps integration');
    
    if (apiKey.trim()) {
      console.log('\n🔒 Security reminder:');
      console.log('- Never commit your .env file to version control');
      console.log('- Restrict your API key to your domain in Google Cloud Console');
      console.log('- Monitor your API usage regularly');
    }
    
    rl.close();
  });
}

process.on('SIGINT', () => {
  console.log('\n❌ Setup interrupted.');
  rl.close();
  process.exit(0);
});