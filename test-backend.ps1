#!/usr/bin/env powershell

Write-Host "🧪 Testing Backend Connectivity..." -ForegroundColor Yellow

# Test backend health endpoint
Write-Host "📡 Testing Backend Health..." -ForegroundColor Blue
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Backend Health Check: PASSED" -ForegroundColor Green
    Write-Host "   Status: $($backendResponse.status)" -ForegroundColor Gray
    Write-Host "   Service: $($backendResponse.service)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test CORS by making a preflight request
Write-Host "🌐 Testing CORS Configuration..." -ForegroundColor Blue
try {
    $corsHeaders = @{
        'Origin' = 'http://localhost:3000'
        'Access-Control-Request-Method' = 'POST'
        'Access-Control-Request-Headers' = 'Content-Type'
    }
    
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/assessments" -Method OPTIONS -Headers $corsHeaders -TimeoutSec 10
    
    if ($corsResponse.Headers.'Access-Control-Allow-Origin' -contains '*' -or 
        $corsResponse.Headers.'Access-Control-Allow-Origin' -contains 'http://localhost:3000') {
        Write-Host "✅ CORS Configuration: PASSED" -ForegroundColor Green
        Write-Host "   Allowed Origins: $($corsResponse.Headers.'Access-Control-Allow-Origin')" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ CORS Configuration: WARNING" -ForegroundColor Yellow
        Write-Host "   Check CORS settings in backend" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ CORS Test: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test basic API endpoint
Write-Host "🔗 Testing API Endpoints..." -ForegroundColor Blue
try {
    $apiResponse = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -TimeoutSec 10
    Write-Host "✅ Root API Endpoint: PASSED" -ForegroundColor Green
    Write-Host "   Message: $($apiResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Root API Endpoint: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check if uploads directory exists
$uploadsDir = "C:\Users\bhavy\OneDrive\Desktop\drop2smart\backend\uploads"
if (Test-Path $uploadsDir) {
    Write-Host "✅ Uploads Directory: EXISTS" -ForegroundColor Green
    Write-Host "   Path: $uploadsDir" -ForegroundColor Gray
} else {
    Write-Host "⚠️ Uploads Directory: MISSING" -ForegroundColor Yellow
    Write-Host "   Creating directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $uploadsDir -Force
    Write-Host "   ✅ Created uploads directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "   If all tests passed, the backend should work with frontend" -ForegroundColor White
Write-Host "   If any tests failed, restart backend with: .\fix-cors.ps1" -ForegroundColor White
Write-Host ""