# Render Deployment Guide for EquiTee API

## Prerequisites
1. Render account (https://render.com) - Free tier available
2. Domain: equitee.golf
3. GitHub repository pushed
4. Supabase project configured

## Deployment Steps

### 1. Push Code to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - EquiTee API"

# Add your GitHub remote and push
git remote add origin https://github.com/yourusername/equitee-api.git
git push -u origin main
```

### 2. Create Render Service
1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the `equitee-api` repository
5. Configure the service:
   - **Name**: `equitee-api`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or paid for custom domain)

### 3. Set Environment Variables
In Render dashboard, add these environment variables:

**Required Variables:**
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
JWT_SECRET=secret_key
FRONTEND_URL=https://equitee.golf
```

### 4. Deploy
- Render will automatically deploy after connecting the repository
- Monitor the build logs in the Render dashboard
- First deployment takes 5-10 minutes

### 5. Configure Custom Domain (Requires Paid Plan)
**Note**: Custom domains require Render's paid plan ($7/month)

1. In Render dashboard → Your service → Settings
2. Scroll to **Custom Domains**
3. Add domain: `api.equitee.golf`
4. Configure DNS at your domain provider:
   - Add CNAME record: `api` → `your-service-name.onrender.com`

### 6. Free Tier Alternative
If using free tier, your API will be available at:
`https://equitee-api-[random].onrender.com`

You can use this URL temporarily and upgrade later for custom domain.

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- 750 hours/month limit
- No custom domains
- Cold start delays (30+ seconds)

### Recommended: Upgrade to Paid Plan
- **Starter Plan**: $7/month
- Custom domains included
- No sleep/cold starts
- Better performance

## Files Configured for Render
- `render.yaml` - Render service configuration
- Updated `main.ts` - Port configuration for Render (10000)
- Existing `Dockerfile` - Can be used alternatively

## Verify Deployment
- API Health Check: `https://your-service.onrender.com/`
- Swagger Documentation: `https://your-service.onrender.com/api/docs`

## Troubleshooting
- Check build logs in Render dashboard
- Verify environment variables are set correctly
- Ensure Supabase connection is working
- Monitor service logs for runtime errors

## Alternative: Use Docker Deployment
If you prefer Docker, Render can also deploy using your existing `Dockerfile`:
- Set **Build Command**: `docker build -t equitee-api .`
- Set **Start Command**: `docker run -p 10000:3001 equitee-api`