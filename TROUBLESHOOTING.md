# 🔧 Troubleshooting CORS Issues

## Current Issue
You're experiencing CORS (Cross-Origin Resource Sharing) errors when the frontend tries to communicate with the backend.

## Quick Fix

### 1. Stop All Running Services
```powershell
# Kill any running Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 2. Restart Backend with CORS Fix
```powershell
.\fix-cors.ps1
```

### 3. Test Backend Connectivity
```powershell
.\test-backend.ps1
```

### 4. Restart Frontend
```powershell
# In a new terminal
cd Frontend
npm run dev
```

## Manual Fix Steps

### Backend Configuration Issues

1. **CORS Headers Not Set Properly**
   - ✅ **Fixed**: Updated `backend/server.js` with proper CORS configuration
   - ✅ **Fixed**: Added multiple allowed origins including `http://localhost:3000`
   - ✅ **Fixed**: Added proper preflight request handling

2. **File Upload Field Name Mismatch**  
   - ✅ **Fixed**: Changed frontend upload field from `'file'` to `'image'`
   - Backend expects: `upload.single('image')`
   - Frontend now sends: `formData.append('image', file)`

3. **Missing Upload Directory**
   - Run: `mkdir backend/uploads` if the directory doesn't exist

### Environment Variables

Make sure your `.env` files are configured:

**Backend `.env`:**
```bash
PORT=5000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/drop2smart
```

**Frontend `.env`:**
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_ML_SERVICE_URL=http://localhost:8000
```

## Common Error Messages & Solutions

### ❌ "CORS header 'Access-Control-Allow-Origin' does not match"
**Solution**: Backend CORS configuration is fixed. Restart backend with `.\fix-cors.ps1`

### ❌ "Failed to upload image"
**Solution**: File field name mismatch is fixed. Upload should work now.

### ❌ "Failed to submit assessment"
**Solution**: This usually means backend is not running or CORS is blocked. 

1. Check backend is running: `http://localhost:5000/health`
2. Restart backend: `.\fix-cors.ps1`

### ❌ "Network error" or "Connection refused"
**Solution**: Backend server is not running.

```powershell
cd backend
npm run dev
```

## Testing Your Fix

### 1. Test Backend Health
Open browser and go to: http://localhost:5000/health

Should return:
```json
{
  "status": "OK",
  "service": "Drop2Smart Backend API",
  "version": "1.0.0"
}
```

### 2. Test CORS
In browser console (F12):
```javascript
fetch('http://localhost:5000/health', {
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:3000'
  }
}).then(r => r.json()).then(console.log)
```

Should not show CORS errors.

### 3. Test File Upload
Try uploading an image in the frontend. Should see success message instead of CORS error.

## Service Startup Order

**Correct order:**
1. MongoDB (starts automatically as Windows service)
2. Backend API (port 5000) - `.\fix-cors.ps1`
3. ML Service (port 8000) - `cd ml_service && python main.py`
4. Frontend (port 3000) - `cd Frontend && npm run dev`

## Still Having Issues?

If problems persist:

1. **Check Windows Firewall**: Might be blocking localhost connections
2. **Check Antivirus**: Some antivirus software blocks local development servers
3. **Try different ports**: Change ports in .env files if 5000/8000/3000 are occupied
4. **Clear browser cache**: Hard refresh (Ctrl+F5) or open incognito window

## Quick Command Summary

```powershell
# Fix CORS and start backend
.\fix-cors.ps1

# Test backend (in new terminal)
.\test-backend.ps1

# Start frontend (in new terminal)
cd Frontend && npm run dev

# Start ML service (in new terminal)  
cd ml_service && python main.py
```

## Success Indicators

✅ **Backend working**: `http://localhost:5000/health` returns JSON
✅ **CORS fixed**: No CORS errors in browser console
✅ **Upload working**: Images can be uploaded without errors
✅ **Assessment working**: Forms can be submitted successfully

After following these steps, your Drop2Smart application should work without CORS issues!