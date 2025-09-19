# 🗺️ Getting Your FREE Google Maps API Key

Google provides **$200 monthly credit** for Google Cloud Platform, which is more than enough for development and moderate usage.

## 📋 **Step-by-Step Guide**

### **Step 1: Create Google Cloud Account**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept the terms of service
4. **Important**: You'll need to add a credit card, but you won't be charged unless you exceed the $200 monthly free credit

### **Step 2: Create a New Project**
1. Click on the project dropdown at the top
2. Click "New Project"
3. Enter project name: `drop2smart-maps` (or any name you prefer)
4. Click "Create"

### **Step 3: Enable Required APIs**
1. Go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API** (for interactive maps)
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for coordinate/address conversion)

### **Step 4: Create API Key**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key immediately
4. Click "Restrict Key" (recommended for security)

### **Step 5: Configure API Key Restrictions (Recommended)**
1. **Application restrictions**: 
   - Select "HTTP referrers (web sites)"
   - Add: `http://localhost:*/*` (for development)
   - Add: `https://yourdomain.com/*` (for production later)
2. **API restrictions**:
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Places API, Geocoding API

### **Step 6: Add to Your Project**
1. Create `.env` file in your `Frontend` folder
2. Add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual key

## 💰 **Cost Breakdown (Why It's Free)**

### **Monthly Free Usage:**
- **Maps JavaScript API**: 28,000 map loads
- **Places API**: 17,000 requests  
- **Geocoding API**: 40,000 requests

### **Your App's Typical Usage:**
- Development: ~100-500 requests/month
- Small production app: ~1,000-5,000 requests/month
- **Result**: Well within free limits! 🎉

## 🔒 **Security Best Practices**

### **DO:**
- ✅ Restrict your API key to specific domains
- ✅ Enable only the APIs you need
- ✅ Monitor usage in Google Cloud Console
- ✅ Keep your API key in `.env` file (never commit to Git)

### **DON'T:**
- ❌ Share your API key publicly
- ❌ Commit `.env` file to version control
- ❌ Leave API key unrestricted

## 🚀 **Quick Setup Commands**

After getting your API key:

```bash
# Navigate to your frontend folder
cd Frontend

# Create .env file
echo VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE > .env

# Start development server
npm run dev
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"This API project is not authorized"**
   - Make sure you enabled all required APIs
   - Check API key restrictions

2. **"RefererNotAllowedMapError"**
   - Add `http://localhost:*/*` to HTTP referrer restrictions

3. **"ApiNotActivatedMapError"** 
   - Enable Maps JavaScript API in Google Cloud Console

4. **Map shows but autocomplete doesn't work**
   - Enable Places API

## 📊 **Monitoring Usage**

1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Dashboard"
3. View your API usage and remaining credits
4. Set up billing alerts if needed

## 💡 **Pro Tips**

- **Development**: Use unrestricted key locally, restrict for production
- **Monitoring**: Check usage weekly to avoid surprises
- **Backup Plan**: Your app already has fallback location features without Maps
- **Production**: Consider implementing rate limiting in your backend

---

**Remember**: The $200 monthly credit is renewed each month, making this effectively free for most applications! 🎉