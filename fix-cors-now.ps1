#!/usr/bin/env powershell

Write-Host "🔥 IMMEDIATE CORS FIX - Drop2Smart Backend" -ForegroundColor Red

# Kill all Node processes
Write-Host "🛑 Killing all Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to backend directory
$backendPath = "C:\Users\bhavy\OneDrive\Desktop\drop2smart\backend"
Set-Location $backendPath

# Ensure uploads directory exists
$uploadsDir = Join-Path $backendPath "uploads"
if (-not (Test-Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir -Force
    Write-Host "📁 Created uploads directory" -ForegroundColor Green
}

# Check MongoDB service
Write-Host "📦 Checking MongoDB..." -ForegroundColor Blue
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
        Start-Service -Name "MongoDB"
        Write-Host "🔄 Started MongoDB service" -ForegroundColor Green
    } else {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ MongoDB service not found - starting without service" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting Backend with DEBUG MODE..." -ForegroundColor Green
Write-Host "📍 Backend URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🧪 CORS Test: http://localhost:5000/test-cors" -ForegroundColor Cyan
Write-Host "📚 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Watch the console for CORS debugging info..." -ForegroundColor Yellow
Write-Host "⚡ Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the debug server
node server-debug.js