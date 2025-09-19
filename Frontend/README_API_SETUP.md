# 🚀 Quick Start - API Setup

## 🎯 **Option 1: Quick Setup (Recommended)**

**For Windows users:**
```bash
npm run setup:windows
```

**For Linux/Mac users:**
```bash
npm run setup
```

This interactive script will guide you through setting up your Google Maps API key.

## 🎯 **Option 2: Manual Setup**

1. **Get your FREE API key** following the [detailed guide](../docs/GOOGLE_MAPS_API_SETUP.md)

2. **Create `.env` file** in the `Frontend` folder:
   ```bash
   # In Frontend/ folder
   touch .env  # Linux/Mac
   # or
   echo. > .env  # Windows
   ```

3. **Add your API key** to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🆓 **No API Key? No Problem!**

Your app works perfectly without an API key! It will automatically:
- ✅ Use IP-based location detection
- ✅ Provide manual coordinate input
- ✅ Use city database for rainfall data
- ✅ Show all core functionality

**With API key, you get:**
- 🗺️ Interactive Google Maps
- 🎯 Address autocomplete
- 📍 Precise geocoding
- 🖱️ Click-to-set location

## 💰 **Cost: $0 (Really!)**

Google provides:
- **$200 monthly credit** (renewed each month)
- **28,000+ map loads** free per month
- **17,000+ address searches** free per month

Your development usage: ~100-500 requests/month = **FREE** ✅

## 🔧 **Troubleshooting**

### **Problem**: App shows "API key not found" warning
- **Solution**: Add API key to `.env` file or ignore (app works without it)

### **Problem**: Map doesn't load
- **Solution**: Check if these APIs are enabled in Google Cloud Console:
  - Maps JavaScript API
  - Places API  
  - Geocoding API

### **Problem**: "RefererNotAllowedMapError"
- **Solution**: Add `http://localhost:*/*` to API key restrictions

## 🛡️ **Security Notes**

- ✅ Never commit `.env` file to Git
- ✅ Restrict API key to your domains only
- ✅ Monitor usage in Google Cloud Console
- ✅ Use environment variables, never hardcode keys

## 📞 **Need Help?**

1. Check the [detailed setup guide](../docs/GOOGLE_MAPS_API_SETUP.md)
2. Your app has fallback features - it works without Maps API
3. The $200 monthly credit makes this effectively free for most users

---

**Ready to start?** Run `npm run setup` or `npm run dev` to begin! 🎉