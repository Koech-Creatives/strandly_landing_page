# Blog Post Count Issue - Fix Summary

## 🔍 Problem

The landing page (https://www.strandlyeu.com/) was only showing 2 blog posts instead of the full 32 posts that were available. The issue was caused by the API call failing in production, which triggered a fallback to a hardcoded 2-post dataset.

## 🔎 Root Cause

1. **Vercel rewrite configuration**: The original `vercel.json` used `(.*)` syntax which doesn't automatically forward query parameters
2. **Silent fallback behavior**: When the API call failed, the code silently fell back to `fallbackPosts.data` which only contained 2 posts
3. **Query parameter handling**: The `access_token` query parameter might not have been properly forwarded to the Directus API

## ✅ Changes Made

### 1. Updated `vercel.json` (lines 5-26)
- Changed rewrite pattern from `(.*)` to `:path*` for proper query parameter forwarding
- Added CORS headers for API endpoint
- This ensures that the `access_token` parameter is properly forwarded to the Directus API

```json
{
  "rewrites": [
    { 
      "source": "/api/:path*", 
      "destination": "https://api.strandlyeu.com/:path*" 
    }
  ]
}
```

### 2. Updated `src/app/blog/page.tsx` (lines 143-158)
- Removed silent fallback to 2-post dataset
- Now shows proper error message when API call fails
- Removed unused imports (`fallbackPosts`, `fallbackTags`)

### 3. Enhanced `src/lib/directus.ts` (lines 5-9, 60-90)
- Added token configuration logging in development mode
- Improved error logging to include response body details
- Better debugging for API failures

## 🚀 Deployment Steps (Render.com)

The landing page is deployed on **Render.com** as a Node.js web service (not a static site).

1. **Verify Environment Variable in Render**:
   - Go to Render Dashboard → Select your service (`strandly-europage-glow`)
   - Go to "Environment" tab
   - Verify `VITE_DIRECTUS_TOKEN` is set
   - Current value should be: `TGiIyGaYHwbxKeM1WfskDfk8TbYnCd8b`

2. **Deploy Changes**:
   ```bash
   cd strandly_landing_page
   git add .
   git commit -m "fix: resolve blog post count issue - improve proxy configuration"
   git push
   ```
   Render will automatically rebuild and deploy your changes.

3. **After Deployment**: 
   - Visit https://www.strandlyeu.com/
   - Check browser console for any API errors
   - Check Render logs for proxy errors
   - Verify all 32 posts are now displayed

## 🐛 Troubleshooting

If the issue persists after deployment:

1. **Check browser console** for error messages
2. **Verify environment variable** in Render:
   - Dashboard → Service → Environment
   - Ensure `VITE_DIRECTUS_TOKEN` is set
   - Value: `TGiIyGaYHwbxKeM1WfskDfk8TbYnCd8b`
3. **Check Render logs** for proxy errors:
   - Dashboard → Service → Logs
   - Look for `[Proxy]` error messages
4. **Test the API directly**:
   ```bash
   curl "https://api.strandlyeu.com/items/posts?filter[status][_eq]=published&limit=1000&access_token=TGiIyGaYHwbxKeM1WfskDfk8TbYnCd8b"
   ```
5. **Verify server is running**:
   - Check that `npm start` is running (not static file serving)
   - Should see: `Server running on port 3000`
   - Should see: `Directus proxy configured for Render deployment`

## 📝 Notes

- The app at http://app.strandlyeu.com/ was not affected because it uses a different Directus integration (`directus-blog.ts`)
- Both projects now have consistent error handling behavior
- The fallback data has been kept in the codebase but is no longer used automatically

## ✅ Expected Result

After deployment, the landing page should now display all 32 blog posts, matching the app's behavior.

