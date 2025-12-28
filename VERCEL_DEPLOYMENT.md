# Vercel Deployment Guide

## Environment Variables Setup

To properly deploy your PixelWalls application to Vercel, you need to configure the following environment variables:

### Required Environment Variables

- `BACKEND_URL`: Your backend URL (e.g., `https://pixelwallsbackend.onrender.com`)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `RAZORPAY_KEY_ID`: Your Razorpay key ID
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Deployment Steps

1. Fork or clone your repository
2. Import the project into Vercel
3. Add the required environment variables in the Vercel dashboard
4. Make sure your backend is deployed and accessible
5. Deploy the frontend

## Troubleshooting

### Login Issues
If users are unable to login after deployment:
- Verify that your backend URL is correctly set in the environment variables
- Check that your backend is deployed and accessible
- Ensure CORS is properly configured on your backend to allow requests from your Vercel domain

### Backend Connection
- Make sure your backend is deployed on Render (or another service) and is publicly accessible
- Verify that the backend URL in your environment variables matches your deployed backend URL
- Check that your backend is properly configured to handle requests from your Vercel domain

## Common Issues

1. **Backend not accessible**: Make sure your backend service is running and accessible at the configured URL
2. **CORS errors**: Ensure your backend allows requests from your Vercel deployment URL
3. **Login fails**: Verify that both frontend and backend are properly configured with correct URLs