# 🌍 Environment Variables Setup Guide

This guide explains how to configure environment variables for the Strandly landing page.

## 📁 Files Created

- `env.example` - Complete template with all available environment variables
- This guide - Step-by-step setup instructions

## 🚀 Quick Setup

### 1. Create Environment File

```bash
# Copy the template to create your local environment file
cp env.example .env.local

# Or create a minimal .env.local file
touch .env.local
```

### 2. Essential Variables (Minimum Required)

Add these to your `.env.local` file:

```bash
# Application Configuration
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:3000

# Directus CMS (Already configured)
VITE_DIRECTUS_URL=https://api.strandlyeu.com
VITE_DIRECTUS_TOKEN=3h9pr1rXhkBhbF7xFj6QwUkDKeCmcUzS

# Supabase (Already configured)
VITE_SUPABASE_URL=https://inpqwwwjjaiqubpblnom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHF3d3dqamFpcXVicGJsbm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjE5MjYsImV4cCI6MjA3MDAzNzkyNn0.oL9w0KPF9ypYZMlP89y8Rt16YmRnciUNUA1LsQw4OlY

# Internationalization
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,de,fr,es,pt,nl,pl,cs

# CORS Configuration
VITE_ENABLE_CORS_PROXY=true

# Development Settings
VITE_DEBUG=true
VITE_ENABLE_CONSOLE_LOGS=true
```

## 🔧 Variable Categories

### 🏗️ Application Configuration
- `VITE_APP_ENV` - Environment (development/staging/production)
- `VITE_APP_URL` - Your application URL
- `VITE_APP_DOMAIN` - Domain for cookies and CORS

### 📝 Content Management (Directus)
- `VITE_DIRECTUS_URL` - Your Directus CMS URL
- `VITE_DIRECTUS_TOKEN` - API authentication token
- `VITE_DIRECTUS_*_ENDPOINT` - Specific API endpoints

### 🗄️ Database (Supabase)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public/anonymous key
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Server-side operations

### 🌍 Internationalization
- `VITE_DEFAULT_LANGUAGE` - Default language code
- `VITE_SUPPORTED_LANGUAGES` - Comma-separated language list
- `VITE_FALLBACK_LANGUAGE` - Fallback language

### 📊 Analytics & Tracking
- `VITE_GA_MEASUREMENT_ID` - Google Analytics 4 ID
- `VITE_GTM_ID` - Google Tag Manager ID
- `VITE_FACEBOOK_PIXEL_ID` - Facebook Pixel ID
- `VITE_HOTJAR_SITE_ID` - Hotjar tracking ID

### 📱 Social Media
- `VITE_TWITTER_HANDLE` - Twitter handle
- `VITE_INSTAGRAM_HANDLE` - Instagram handle
- `VITE_FACEBOOK_PAGE` - Facebook page URL
- `VITE_LINKEDIN_PAGE` - LinkedIn company page

### 📧 Contact Information
- `VITE_CONTACT_EMAIL` - General contact email
- `VITE_SUPPORT_EMAIL` - Support email
- `VITE_PRESS_EMAIL` - Press/media email
- `VITE_BUSINESS_ADDRESS` - Business address
- `VITE_BUSINESS_PHONE` - Business phone number

### 💳 External Services
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_PAYPAL_CLIENT_ID` - PayPal client ID
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

### 🔒 Security & Privacy
- `VITE_CSP_NONCE` - Content Security Policy nonce
- `VITE_ENABLE_COOKIE_CONSENT` - Enable cookie consent
- `VITE_GDPR_ENABLED` - Enable GDPR compliance

### 🚀 Feature Flags
- `VITE_ENABLE_BLOG` - Enable blog functionality
- `VITE_ENABLE_WAITLIST` - Enable waitlist signup
- `VITE_ENABLE_BOOKING` - Enable booking system
- `VITE_ENABLE_PAYMENTS` - Enable payment processing
- `VITE_ENABLE_USER_ACCOUNTS` - Enable user accounts

## 🔄 Using Environment Variables in Code

### Vite Environment Variables
All environment variables must be prefixed with `VITE_` to be accessible in the browser:

```typescript
// ✅ Correct - accessible in browser
const apiUrl = import.meta.env.VITE_DIRECTUS_URL;

// ❌ Wrong - not accessible in browser
const secretKey = import.meta.env.SECRET_KEY;
```

### Example Usage

```typescript
// src/lib/config.ts
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Strandly',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },
  directus: {
    url: import.meta.env.VITE_DIRECTUS_URL || 'https://api.strandlyeu.com',
    token: import.meta.env.VITE_DIRECTUS_TOKEN,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  features: {
    blog: import.meta.env.VITE_ENABLE_BLOG === 'true',
    waitlist: import.meta.env.VITE_ENABLE_WAITLIST === 'true',
    booking: import.meta.env.VITE_ENABLE_BOOKING === 'true',
  },
};
```

## 🚀 Deployment

### Render.com
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add your environment variables
5. Redeploy your service

### Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add your variables for each environment
5. Redeploy

### Netlify
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add your variables
5. Redeploy

## 🔐 Security Best Practices

### ✅ Do
- Use `VITE_` prefix for client-side variables
- Keep sensitive data server-side only
- Use different values for different environments
- Regularly rotate API keys and tokens

### ❌ Don't
- Put secrets in client-side environment variables
- Commit `.env.local` to version control
- Use production keys in development
- Share environment files in chat/email

## 🐛 Troubleshooting

### Variable Not Loading
1. Check the variable name starts with `VITE_`
2. Restart your development server
3. Check for typos in variable names
4. Ensure the variable is in `.env.local`

### Build Issues
1. Make sure all required variables are set
2. Check for missing quotes around values
3. Verify no special characters in values
4. Check the build logs for specific errors

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Need Help?** Check the main README.md or open an issue on GitHub.
