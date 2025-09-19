# Drop2Smart - Google Maps API Setup Script
# PowerShell version for Windows users

Write-Host "🗺️  Drop2Smart - Google Maps API Setup" -ForegroundColor Cyan
Write-Host ""

$envFilePath = ".\.env"

# Check if .env already exists
if (Test-Path $envFilePath) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "yes") {
        Write-Host "❌ Setup cancelled. Your existing .env file is unchanged." -ForegroundColor Red
        exit
    }
}

Write-Host "📋 Please follow these steps to get your FREE Google Maps API key:" -ForegroundColor Green
Write-Host "1. Go to: https://console.cloud.google.com/"
Write-Host "2. Create a new project or select existing one"
Write-Host "3. Enable: Maps JavaScript API, Places API, Geocoding API"
Write-Host "4. Create credentials > API Key"
Write-Host "5. Copy your API key"
Write-Host ""

$apiKey = Read-Host "Enter your Google Maps API key (or press Enter to skip)"

$envContent = ""

if ($apiKey.Trim()) {
    # Basic validation
    if ($apiKey.Length -lt 30 -or -not $apiKey.StartsWith("AIza")) {
        Write-Host "⚠️  Warning: This doesn't look like a valid Google Maps API key." -ForegroundColor Yellow
        Write-Host "   Google Maps API keys usually start with 'AIza' and are 39+ characters long."
    }
    
    $envContent = @"
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=$($apiKey.Trim())

# Other environment variables
# Add more variables here as needed
"@
    
    Write-Host "✅ API key configured!" -ForegroundColor Green
} else {
    $envContent = @"
# Google Maps API Configuration
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Other environment variables
# Add more variables here as needed
"@
    
    Write-Host "ℹ️  Skipped API key setup. You can add it later to the .env file." -ForegroundColor Blue
}

# Write .env file
try {
    $envContent | Out-File -FilePath $envFilePath -Encoding UTF8
    Write-Host "📁 Created .env file successfully!" -ForegroundColor Green
    
    # Create .env.example if it doesn't exist
    if (-not (Test-Path ".\.env.example")) {
        $exampleContent = @"
# Google Maps API Configuration
# Get your free API key from: https://console.cloud.google.com/
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Other environment variables
# Add more variables here as needed
"@
        $exampleContent | Out-File -FilePath ".\.env.example" -Encoding UTF8
        Write-Host "📄 Created .env.example file for reference." -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error creating .env file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the development server: npm run dev"
Write-Host "2. Your app will automatically use fallback location features if no API key is provided"
Write-Host "3. Add a valid API key later to enable full Google Maps integration"

if ($apiKey.Trim()) {
    Write-Host ""
    Write-Host "🔒 Security reminder:" -ForegroundColor Yellow
    Write-Host "- Never commit your .env file to version control"
    Write-Host "- Restrict your API key to your domain in Google Cloud Console"
    Write-Host "- Monitor your API usage regularly"
}

Write-Host ""
Write-Host "✨ Setup complete! Run 'npm run dev' to start your app." -ForegroundColor Green