# Profile Image Upload - Testing Guide

## What Was Fixed

### Backend Changes:
1. **User Model** - Added `profileImage` field to store image URLs
2. **UserController** - Created `/api/admin/users/{userId}/profile-image` endpoint
3. **WebConfig** - Configured static file serving for `/uploads/**` URLs

### Frontend Changes:
1. **auth.service.js** - Fixed image URL construction to include full backend URL
2. **DashboardLayout.tsx** - Improved upload handling and switched to `<img>` tag
3. **Better error handling** - Added console logging and user feedback

## How to Test

### Step 1: Restart Backend
```bash
cd c:\sample\hospitalmanagement
.\mvnw spring-boot:run
```

### Step 2: Check Frontend is Running
```bash
cd c:\sample\frontend2
npm run dev
```

### Step 3: Test Upload
1. Login to admin dashboard
2. Click the camera icon on your profile picture
3. Select an image file (JPG, PNG, etc.)
4. Watch for:
   - Success alert: "Profile image uploaded successfully!"
   - Image should display immediately
   - Check browser console (F12) for logs

### Step 4: Verify Persistence
1. Refresh the page (F5)
2. Profile image should still be displayed
3. Check localStorage in browser DevTools:
   - Application tab → Local Storage → http://localhost:3000
   - Look for "user" key
   - Should contain `profileImage` field with full URL

## Debugging

### If image doesn't display:

1. **Check Console Logs:**
   ```
   F12 → Console tab
   Look for:
   - "Uploading profile image for user: X"
   - "Upload response: {...}"
   - "Full image URL: http://localhost:8080/uploads/..."
   - "localStorage user profileImage updated: ..."
   ```

2. **Check Network Tab:**
   ```
   F12 → Network tab
   - Look for POST to /api/admin/users/{id}/profile-image
   - Check response: should have imageUrl field
   - Look for GET to /uploads/profile-images/xxx.jpg
   - Status should be 200
   ```

3. **Check Backend Logs:**
   - Look for file upload success messages
   - Check if `uploads/profile-images/` directory was created
   - Verify image file exists in that directory

4. **Check localStorage:**
   ```javascript
   // In browser console:
   JSON.parse(localStorage.getItem('user'))
   // Should show profileImage field
   ```

## Common Issues

### Issue: 404 on image URL
**Solution:** Backend not serving static files correctly. Check WebConfig.java is loaded.

### Issue: CORS error
**Solution:** Image URL should use same origin (localhost:8080) or be proxied through Next.js.

### Issue: Image uploads but doesn't display
**Solution:** Check localStorage was updated. Try refreshing the page.

### Issue: "No image URL returned from server"
**Solution:** Backend endpoint not returning imageUrl in response. Check UserController response format.

## Expected Behavior

✅ Click camera icon → File picker opens
✅ Select image → Upload starts
✅ Success alert appears
✅ Image displays immediately
✅ Refresh page → Image persists
✅ Console shows full image URL like: `http://localhost:8080/uploads/profile-images/uuid.jpg`
