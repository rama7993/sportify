# 🚀 Deployment Guide - Sportify

This guide will help you deploy the Sportify Angular application to Vercel with server-side rendering (SSR).

## 📋 Prerequisites

1. **Spotify Developer Account**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note down your Client ID and Client Secret

2. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

## 🔧 Local Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd sportify
   npm install
   ```

2. **Set up environment variables**
   - Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     spotify: {
       clientId: 'your-actual-client-id',
       clientSecret: 'your-actual-client-secret'
     }
   };
   ```

3. **Test locally**
   ```bash
   # Development server
   ng serve
   
   # SSR server
   ng build --configuration production
   npm run serve:ssr:sportify
   ```

## 🌐 Vercel Deployment

### Method 1: Vercel CLI (Recommended)

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables**
   - Go to your project dashboard on Vercel
   - Navigate to Settings > Environment Variables
   - Add:
     - `SPOTIFY_CLIENT_ID`: Your Spotify Client ID
     - `SPOTIFY_CLIENT_SECRET`: Your Spotify Client Secret

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set build command: `ng build --configuration production`
   - Set output directory: `dist/sportify/browser`

3. **Configure environment variables**
   - Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
   - Deploy

## 🔍 Verification

After deployment, verify:

1. **Homepage loads** with dashboard content
2. **Search functionality** works
3. **Artist pages** display correctly
4. **SSR is working** (view page source should show rendered HTML)
5. **API calls** are successful (check browser network tab)

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with "Module not found"**
   - Ensure all dependencies are installed: `npm install`
   - Check if all imports are correct

2. **API calls return 401/403**
   - Verify Spotify credentials are correct
   - Check if environment variables are set in Vercel

3. **SSR not working**
   - Ensure `vercel.json` is in the root directory
   - Check that `server.ts` is properly configured

4. **Styling issues**
   - Verify SCSS compilation is working
   - Check if Bootstrap CSS is loading

### Debug Commands

```bash
# Check build locally
ng build --configuration production

# Test SSR server
npm run serve:ssr:sportify

# Check Vercel logs
vercel logs <deployment-url>
```

## 📊 Performance Optimization

1. **Enable compression** in Vercel settings
2. **Use CDN** for static assets
3. **Optimize images** (already implemented)
4. **Enable caching** for API responses

## 🔒 Security Notes

- Never commit real API credentials to Git
- Use environment variables for all sensitive data
- Enable HTTPS (automatic with Vercel)
- Consider rate limiting for API calls

## 📈 Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking with Sentry (optional)
- Monitor API usage in Spotify Dashboard

## 🎯 Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure CI/CD** for automatic deployments
3. **Add monitoring and analytics**
4. **Optimize for Core Web Vitals**

---

**Your Sportify app should now be live! 🎉**

Visit your Vercel URL to see the deployed application.
