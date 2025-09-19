@echo off
echo Starting Drop2Smart Backend Server...
echo.
echo Backend will run at: http://localhost:5000
echo Health Check: http://localhost:5000/health  
echo CORS Test: http://localhost:5000/test-cors
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "C:\Users\bhavy\OneDrive\Desktop\drop2smart\backend"
node server-quick-fix.js

pause