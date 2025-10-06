# 🚀 Deployment Guide - Sportify App

This guide covers deploying both the Angular frontend and Node.js backend separately.

## 📋 Prerequisites

- Vercel account (for frontend)
- Railway account (for backend) - [Sign up here](https://railway.app)
- Spotify Developer account with API credentials

## 🎯 Frontend Deployment (Vercel)

### 1. Deploy to Vercel

Your frontend is already configured for Vercel. Simply:

```bash
# In the sportify directory
vercel --prod
```

Or push to your connected Git repository - Vercel will auto-deploy.

### 2. Get Frontend URL

After deployment, note your Vercel URL (e.g., `https://sportify-app.vercel.app`)

## 🔧 Backend Deployment (Railway)

### 1. Prepare Backend

```bash
cd sportify/backend
npm install
```

### 2. Deploy to Railway

**Option A: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

**Option B: Railway Dashboard**
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Set root directory to `sportify/backend`

### 3. Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
PORT=3000
SPOTIFY_CLIENT_ID=your_actual_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_actual_spotify_client_secret
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### 4. Get Backend URL

After deployment, note your Railway URL (e.g., `https://sportify-backend.railway.app`)

## 🔗 Connect Frontend to Backend

### 1. Update Backend Service

Edit `sportify/src/services/backend.service.ts`:

```typescript
private apiUrl = environment.production 
  ? 'https://your-actual-backend-url.railway.app/api/spotify'
  : 'http://localhost:3000/api/spotify';
```

### 2. Update Environment

Edit `sportify/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  spotify: {
    clientId: 'your_spotify_client_id',
    clientSecret: 'your_spotify_client_secret',
  },
  backendUrl: 'https://your-actual-backend-url.railway.app'
};
```

### 3. Redeploy Frontend

```bash
vercel --prod
```

## 🧪 Test Deployment

### 1. Test Backend

```bash
curl https://your-backend-url.railway.app/health
curl https://your-backend-url.railway.app/api/spotify/test
```

### 2. Test Frontend

Visit your Vercel URL and test:
- Browse categories
- Search for tracks
- Test preview functionality
- Check "Test Backend" button

## 🔄 Alternative: Vercel Full-Stack

If you prefer to keep everything on Vercel:

### 1. Create Vercel Functions

Create `sportify/api/spotify/preview.js`:

```javascript
const { SpotifyPreviewFinder } = require('spotify-preview-finder');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { trackName, artistName } = req.body;
    
    const spotifyPreviewFinder = new SpotifyPreviewFinder({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const result = await spotifyPreviewFinder.searchForPreview(
      trackName, 
      artistName, 
      1
    );

    res.json({
      success: true,
      previewUrl: result.results?.[0]?.previewUrls?.[0] || null,
      track: result.results?.[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 2. Update Backend Service

```typescript
private apiUrl = environment.production 
  ? '/api/spotify'  // Vercel functions
  : 'http://localhost:3000/api/spotify';
```

### 3. Add Environment Variables

In Vercel dashboard, add:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGIN` matches your frontend URL
   - Ensure backend allows your frontend domain

2. **Environment Variables**
   - Verify all required env vars are set
   - Check variable names match exactly

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Preview Not Working**
   - Test backend endpoints directly
   - Check Spotify API credentials
   - Verify network connectivity

### Debug Commands

```bash
# Test backend health
curl https://your-backend-url.railway.app/health

# Test preview endpoint
curl -X POST https://your-backend-url.railway.app/api/spotify/preview \
  -H "Content-Type: application/json" \
  -d '{"trackName":"Shape of You","artistName":"Ed Sheeran"}'

# Check Vercel deployment
vercel logs
```

## 📊 Monitoring

### Railway
- Check deployment logs in Railway dashboard
- Monitor resource usage
- Set up alerts for failures

### Vercel
- Use Vercel Analytics
- Monitor function execution
- Check build logs

## 🔒 Security Notes

- Never commit `.env` files
- Use environment variables for secrets
- Enable HTTPS for all endpoints
- Set up proper CORS policies
- Monitor API usage and rate limits

## 🎉 Success!

Once deployed, your app will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

Users can now browse Spotify content with working preview functionality!
