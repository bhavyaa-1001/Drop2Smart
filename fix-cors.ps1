#!/usr/bin/env powershell

Write-Host "🔧 Fixing CORS Issues..." -ForegroundColor Yellow

# Kill any existing backend processes
Write-Host "🛑 Stopping existing backend processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Where-Object { $_.MainModule.FileName -like "*backend*" } | Stop-Process -Force
    Write-Host "✅ Stopped existing backend processes" -ForegroundColor Green
}

# Check if MongoDB is running
Write-Host "📦 Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -ne "Running") {
    Start-Service -Name "MongoDB"
    Write-Host "🔄 Started MongoDB service" -ForegroundColor Green
} elseif ($mongoService) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️ MongoDB service not found. Please ensure MongoDB is installed." -ForegroundColor Red
}

# Navigate to backend directory
Set-Location "C:\Users\bhavy\OneDrive\Desktop\drop2smart\backend"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ .env file not found. Creating one..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting backend with CORS fixes..." -ForegroundColor Green
Write-Host "📍 Backend will run on: http://localhost:5000" -ForegroundColor Blue
Write-Host "🌐 CORS enabled for: http://localhost:3000" -ForegroundColor Blue
Write-Host ""

# Start the backend server
npm run dev