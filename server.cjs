const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Global CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Proxy API requests to Directus
app.use('/api', createProxyMiddleware({
  target: 'https://api.strandlyeu.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api': '', // remove /api prefix when forwarding to Directus
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Proxy] Request:', req.method, req.path);
    console.log('[Proxy] Forwarding to:', `https://api.strandlyeu.com${req.path}`);
    
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('[Proxy] Response status:', proxyRes.statusCode);
    
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
  },
  onError: (err, req, res) => {
    console.error('[Proxy] Error:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router (return index.html for all non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
