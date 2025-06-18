# Troubleshooting Guide

## Current Issues and Solutions

### 1. Route Warnings (FIXED)
**Issue**: Warnings about non-existent routes "search", "watchlist", and "settings"
**Solution**: ✅ Removed invalid route references from `app/_layout.tsx`

### 2. AI Search JSON Parse Error
**Issue**: `SyntaxError: JSON Parse error: Unexpected character: H`
**Cause**: Groq API sometimes returns HTML error pages instead of JSON

**Solutions**:

#### Option A: Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart with cache clear
npx expo start --clear
```

#### Option B: Check Your Groq API Key
1. Verify your `.env` file has the correct Groq API key:
```
EXPO_PUBLIC_GROQ_API_KEY=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
```

2. If the key is invalid, get a new one from [Groq Console](https://console.groq.com/keys)

#### Option C: Test Without AI Features
The app will work perfectly without AI features. Regular search functionality includes:
- Movie search
- People search  
- Multi-search
- Collection search
- Advanced filtering

### 3. Testing the Enhanced Search

#### Basic Search (Always Works)
1. Open the Search tab
2. Try searching for "Avengers" or "Tom Hanks"
3. Switch between search types using the tabs

#### AI Search (Requires Valid API Key)
1. Select "AI Search" tab
2. Try natural language queries:
   - "funny movies from the 90s"
   - "Tom Hanks romantic films"
   - "scary movies like The Conjuring"

### 4. Verifying New Features

#### Cast & Crew Pages
1. Go to any movie detail page
2. Scroll to "Cast & Crew" section
3. Tap "View All" to see the new cast page
4. Tap any cast member to see their profile

#### Reviews Page
1. On a movie detail page
2. Scroll to "Reviews" section  
3. Tap "View All" to see the new reviews page

#### Similar Movies Page
1. On a movie detail page
2. Scroll to "Similar Movies" section
3. Tap "View All" to see the new similar movies page

### 5. Performance Tips

#### If Search is Slow
- Check your internet connection
- The first AI search may take longer as the model loads
- Regular TMDB searches should be fast

#### If Images Don't Load
- Check internet connection
- TMDB image servers may be slow
- Placeholder images will show while loading

### 6. Development Commands

#### Clear Cache and Restart
```bash
npx expo start --clear
```

#### Check for TypeScript Errors
```bash
npx tsc --noEmit
```

#### Reset Metro Cache
```bash
npx expo start --clear --reset-cache
```

### 7. Feature Status

✅ **Working Features**:
- Enhanced search with multiple types
- Cast & crew pages with real API data
- Person profiles with filmography
- Reviews page with filtering
- Similar movies page with sorting
- Professional UI design
- Error handling and fallbacks

⚠️ **Requires Setup**:
- AI search (needs Groq API key)
- AI suggestions (needs Groq API key)

🔧 **Optional Enhancements**:
- Voice search
- Search history
- Offline capabilities

### 8. Getting Help

If you encounter other issues:

1. **Check the Console**: Look for error messages in the terminal
2. **Restart the App**: Often fixes temporary issues
3. **Clear Cache**: Use `--clear` flag when starting
4. **Check Network**: Ensure internet connection for API calls

### 9. API Key Setup (For AI Features)

1. **Get Groq API Key**:
   - Visit [console.groq.com](https://console.groq.com/keys)
   - Create account or sign in
   - Generate new API key
   - Copy the key

2. **Add to Environment**:
   ```
   EXPO_PUBLIC_GROQ_API_KEY=your_actual_key_here
   ```

3. **Restart Development Server**:
   ```bash
   npx expo start --clear
   ```

### 10. Success Indicators

**App is Working Correctly When**:
- No route warnings in console
- Search returns results for "Avengers"
- Cast pages load with real data
- Images load properly
- Navigation works smoothly

**AI Features Working When**:
- AI Search tab shows suggestions
- Natural language queries return relevant results
- Auto-suggestions appear while typing
- Result explanations are provided

---

## Quick Test Checklist

- [ ] App starts without route warnings
- [ ] Basic movie search works
- [ ] Cast & crew pages load
- [ ] Person profiles show real data
- [ ] Reviews page displays properly
- [ ] Similar movies page works
- [ ] AI search provides suggestions (if API key configured)
- [ ] Navigation between pages is smooth
- [ ] Images load correctly

If all items are checked, your enhanced search functionality is working perfectly! 🎉