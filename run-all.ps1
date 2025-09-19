#!/usr/bin/env powershell

Write-Host "🚀 Starting Drop2Smart Full-Stack Application..." -ForegroundColor Green

# Function to start a service in background
function Start-Service {
    param(
        [string]$Name,
        [string]$Directory,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "🔄 Starting $Name..." -ForegroundColor $Color
    
    $job = Start-Job -ScriptBlock {
        param($dir, $cmd)
        Set-Location $dir
        Invoke-Expression $cmd
    } -ArgumentList $Directory, $Command -Name $Name
    
    return $job
}

# Store current location
$originalLocation = Get-Location

try {
    # Start MongoDB if not running
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -ne "Running") {
        Start-Service -Name "MongoDB"
        Write-Host "🔄 Started MongoDB service" -ForegroundColor Green
    }

    # Start Backend
    $backendJob = Start-Service -Name "Backend" -Directory "$originalLocation\backend" -Command "npm run dev" -Color "Blue"
    Start-Sleep 2

    # Start ML Service  
    $mlJob = Start-Service -Name "ML-Service" -Directory "$originalLocation\ml_service" -Command "python main.py" -Color "Magenta"
    Start-Sleep 3

    # Start Frontend
    $frontendJob = Start-Service -Name "Frontend" -Directory "$originalLocation\Frontend" -Command "npm run dev" -Color "Cyan"
    Start-Sleep 2

    Write-Host ""
    Write-Host "🎉 All services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor Yellow
    Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
    Write-Host "   ML Service:  http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Yellow
    Get-Job | Format-Table Name, State -AutoSize
    Write-Host ""
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "   - Press Ctrl+C to stop all services" -ForegroundColor White
    Write-Host "   - Use 'Get-Job' to check service status" -ForegroundColor White
    Write-Host "   - Use 'Receive-Job -Name <service>' to see logs" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Monitoring services... (Press Ctrl+C to stop)" -ForegroundColor Green

    # Monitor services
    while ($true) {
        Start-Sleep 5
        $jobs = Get-Job
        $failed = $jobs | Where-Object { $_.State -eq "Failed" }
        
        if ($failed) {
            Write-Host "❌ Some services failed:" -ForegroundColor Red
            $failed | ForEach-Object {
                Write-Host "   - $($_.Name): $($_.State)" -ForegroundColor Red
                Receive-Job -Job $_
            }
        }
        
        # Check if all jobs are still running
        $running = $jobs | Where-Object { $_.State -eq "Running" }
        if ($running.Count -eq 0) {
            Write-Host "⚠️ All services have stopped." -ForegroundColor Yellow
            break
        }
    }

} catch [System.Management.Automation.ActionPreferenceStopException] {
    Write-Host ""
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clean up jobs
    Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job -Force
    
    Set-Location $originalLocation
    Write-Host "✅ All services stopped." -ForegroundColor Green
}