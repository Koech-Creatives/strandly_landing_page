const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Server will proxy /api/* to https://api.strandlyeu.com/*');
console.log('Directus proxy configured for Render deployment');

// Parse JSON bodies
app.use(express.json());

// Create the proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'https://api.strandlyeu.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api': '', // remove /api prefix when forwarding to Directus
  },
  onProxyReq: (proxyReq, req, res) => {
    const targetUrl = req.url.replace('/api', '');
    console.log('[Proxy] Forwarding:', req.method, req.url, '→ https://api.strandlyeu.com' + targetUrl);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('[Proxy] Response:', proxyRes.statusCode, req.url);
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
  },
  onError: (err, req, res) => {
    console.error('[Proxy] Error:', err.message);
    console.error('[Proxy] Request URL:', req.url);
    console.error('[Proxy] Error details:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy error', message: err.message });
    }
  }
});

// Proxy API requests FIRST (before static files)
app.use('/api', (req, res, next) => {
  console.log('[Proxy] Incoming API request:', req.method, req.path, req.url);
  next();
}, apiProxy);

// Serve static files from dist directory
const staticMiddleware = express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y'
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    // Skip static file serving for API routes
    return next();
  }
  staticMiddleware(req, res, next);
});

// Handle React Router (return index.html for all non-API routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    // API routes should have been handled by proxy - return 404 if not
    console.error('[Server] API route not handled by proxy:', req.path);
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'dist')}`);
  console.log('Proxy middleware configured for /api routes');
});
