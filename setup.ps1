#!/usr/bin/env powershell

Write-Host "🚀 Setting up Drop2Smart Full-Stack Application..." -ForegroundColor Green

# Check if MongoDB is installed
Write-Host "📦 Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if (-not $mongoService) {
    Write-Host "❌ MongoDB is not installed. Please install MongoDB Community Edition first." -ForegroundColor Red
    Write-Host "📖 Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Blue
    exit 1
} else {
    Write-Host "✅ MongoDB found" -ForegroundColor Green
    # Start MongoDB service if not running
    if ($mongoService.Status -ne "Running") {
        Start-Service -Name "MongoDB"
        Write-Host "🔄 Started MongoDB service" -ForegroundColor Green
    }
}

# Check if Python is installed
Write-Host "🐍 Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python is not installed. Please install Python 3.8 or higher." -ForegroundColor Red
    Write-Host "📖 Download from: https://www.python.org/downloads/" -ForegroundColor Blue
    exit 1
} else {
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
}

# Check if Node.js is installed
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    Write-Host "📖 Download from: https://nodejs.org/" -ForegroundColor Blue
    exit 1
} else {
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "📁 Setting up Backend (Express.js + MongoDB)..." -ForegroundColor Cyan
Set-Location backend
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend package.json not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📁 Setting up ML Service (FastAPI)..." -ForegroundColor Cyan
Set-Location ../ml_service
if (Test-Path "requirements.txt") {
    # Create virtual environment
    python -m venv venv
    if ($IsWindows) {
        .\venv\Scripts\Activate.ps1
    } else {
        source venv/bin/activate
    }
    pip install -r requirements.txt
    Write-Host "✅ ML Service dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ ML Service requirements.txt not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📁 Setting up Frontend (React + Vite)..." -ForegroundColor Cyan
Set-Location ../Frontend
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Yellow
Write-Host "   1. Start Backend:    cd backend && npm run dev" -ForegroundColor White
Write-Host "   2. Start ML Service: cd ml_service && python main.py" -ForegroundColor White  
Write-Host "   3. Start Frontend:   cd Frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   ML Service:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Or use the run-all.ps1 script to start all services at once!" -ForegroundColor Blue