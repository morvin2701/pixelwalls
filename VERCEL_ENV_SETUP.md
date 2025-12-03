# Vercel Environment Variables Setup

To ensure Supabase integration works correctly in your Vercel deployment, you need to add the following environment variables to your Vercel project.

## Required Environment Variables

1. `VITE_SUPABASE_URL` - Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## How to Add Environment Variables to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (pixelwalls)
3. Click on the "Settings" tab
4. In the left sidebar, click on "Environment Variables"
5. Add the following variables:

| Name | Value | Description |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://jjzhxvrgxpkpomijfnzm.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqemh4dnJneHBrcG9taWpmbnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Mzc1NTMsImV4cCI6MjA4MDMxMzU1M30.qsnLkgV7JoW27bA2BxWw1KmVim1BZIEfwot4hFiCiPU` | Your Supabase anonymous key |

6. Click "Add" for each variable
7. Redeploy your application

### Method 2: Using Vercel CLI

If you have Vercel CLI installed, you can add environment variables using the command line:

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Follow the prompts to enter the values for each variable.

## Verification

After adding the environment variables:

1. Trigger a new deployment by pushing a small change to your GitHub repository
2. Check the deployment logs to ensure the environment variables are being loaded
3. Once deployed, open your application and check the browser console for Supabase initialization messages
4. Generate a new wallpaper and verify it appears in your Supabase storage bucket

## Troubleshooting

If images still aren't appearing in Supabase:

1. Check the browser console for error messages
2. Look for messages like "Supabase environment variables (Vercel format)" to confirm variables are loaded
3. Check that the bucket name is correct (`generated_images`)
4. Verify that the file path is correct (`placeholders/wallpaper-*.png`)