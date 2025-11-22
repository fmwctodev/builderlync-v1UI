# BuilderLync Deployment Guide

## Build Status
✅ Production build completed successfully (2.8 MB total)

## Quick Deploy to Netlify

### Option 1: Netlify CLI (Recommended)
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy the site
netlify deploy --prod
```

### Option 2: Netlify Web UI
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18
5. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
6. Click "Deploy site"

### Option 3: Drag and Drop Deploy
1. Go to https://app.netlify.com/drop
2. Drag and drop the `dist` folder
3. Note: You'll need to manually configure environment variables in the Netlify dashboard after deployment

## Alternative Platforms

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Manual Deployment
The `dist` folder contains all static files needed for deployment. You can upload this folder to any static hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages
- Any web server (Apache, Nginx, etc.)

## Environment Variables Required
Make sure these are configured in your hosting platform:
- `VITE_SUPABASE_URL`: https://ooioyocavxslptjvbrcl.supabase.co
- `VITE_SUPABASE_ANON_KEY`: (Your Supabase anonymous key)

## Important Notes
- The build is configured for SPA routing with `_redirects` file
- All routes redirect to index.html for client-side routing
- Build artifacts are optimized and minified
- Total build size: 2.8 MB (570 KB gzipped JavaScript, 12 KB gzipped CSS)

## Post-Deployment Checklist
- [ ] Verify all environment variables are set correctly
- [ ] Test authentication flow with Supabase
- [ ] Check all six modules load properly:
  - ABC Supply
  - CRM
  - Marketing
  - Project Management
  - Edge View
  - Roof Runner
- [ ] Test routing and navigation
- [ ] Verify responsive design on mobile devices
- [ ] Check browser console for any errors
- [ ] Test database connections and data fetching

## Custom Domain Setup (Optional)
After deployment, you can add a custom domain in your hosting platform's dashboard:
- Netlify: Site settings → Domain management
- Vercel: Project settings → Domains

## Rollback Instructions
If you need to rollback:
- **Netlify**: Deploys → Select previous deploy → "Publish deploy"
- **Vercel**: Deployments → Select previous deployment → "Promote to Production"

## Support
For deployment issues:
1. Check build logs in your hosting platform
2. Verify environment variables are set correctly
3. Ensure Supabase database is accessible from the production domain
4. Check browser console for runtime errors
