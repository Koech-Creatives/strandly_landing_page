const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Server will proxy /api/* to https://api.strandlyeu.com/*');

// Parse JSON bodies
app.use(express.json());

// Proxy API requests to Directus (MUST come before static file serving)
app.use('/api', (req, res, next) => {
  console.log('[Proxy] API Request:', req.method, req.url);
  next();
}, createProxyMiddleware({
  target: 'https://api.strandlyeu.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api': '', // remove /api prefix when forwarding to Directus
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Proxy] Forwarding:', req.method, req.url, '→ https://api.strandlyeu.com' + req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('[Proxy] Response:', proxyRes.statusCode, req.url);
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  },
  onError: (err, req, res) => {
    console.error('[Proxy] Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy error', message: err.message });
    }
  }
}));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y'
}));

// Handle React Router (return index.html for all non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'dist')}`);
});
