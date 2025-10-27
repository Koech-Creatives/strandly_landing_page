// Use the Directus API endpoint (the actual service location, not the CDN/proxy)
const DIRECTUS_URL = 'https://strandly.onrender.com/api';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '';

// Log token status in development
if (import.meta.env.DEV) {
  console.log('[Directus] Token configured:', DIRECTUS_TOKEN ? 'Yes' : 'No');
  console.log('[Directus] Token value:', DIRECTUS_TOKEN ? `${DIRECTUS_TOKEN.substring(0, 10)}...` : 'Missing');
}

class DirectusFetchError extends Error {
  status?: number;
  endpoint: string;
  url: string;
  details?: unknown;
  constructor(message: string, info: { status?: number; endpoint: string; url: string; details?: unknown }) {
    super(message);
    this.name = 'DirectusFetchError';
    this.status = info.status;
    this.endpoint = info.endpoint;
    this.url = info.url;
    this.details = info.details;
  }
}

export const directusFetch = async (endpoint: string, options?: RequestInit) => {
  // Make DIRECT API calls to Directus (no proxy needed)
  let directUrl = `${DIRECTUS_URL}${endpoint}`;
  
  // Add access token to query string if not already present
  if (DIRECTUS_TOKEN) {
    try {
      const url = new URL(directUrl);
      if (!url.searchParams.has('access_token')) {
        url.searchParams.set('access_token', DIRECTUS_TOKEN);
      }
      directUrl = url.toString();
    } catch (error) {
      console.error('[Directus] Error constructing URL:', error);
      // Fallback: append token manually
      const separator = endpoint.includes('?') ? '&' : '?';
      directUrl = `${DIRECTUS_URL}${endpoint}${separator}access_token=${DIRECTUS_TOKEN}`;
    }
  }
  
  // Debug logging
  console.log('[Directus] Fetching:', endpoint);
  console.log('[Directus] Direct URL:', directUrl);
  console.log('[Directus] Token set:', !!DIRECTUS_TOKEN);
  
  try {
    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const statusText = response.status === 404 
        ? 'API endpoint not found'
        : response.statusText;
      
      let message = `Failed to fetch data from Directus: ${response.status} ${statusText}`;
      let details: unknown = undefined;
      
      try {
        // Clone the response to read it without consuming it
        const clonedResponse = response.clone();
        const responseText = await clonedResponse.text();
        console.error('[Directus] Error response:', {
          status: response.status,
          statusText: response.statusText,
          url: directUrl,
          responseBody: responseText.substring(0, 200) // First 200 chars
        });
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          details = JSON.parse(responseText);
          // @ts-expect-error best-effort message extraction
          message = details?.errors?.[0]?.message || message;
        }
      } catch (_e) {
        // ignore JSON parse error
      }
      
      throw new DirectusFetchError(message, { status: response.status, endpoint, url: directUrl, details });
    }

    return response.json();
  } catch (error) {
    console.error('[Directus] Error:', error);
    throw error;
  }
};

export const getDirectusAssetUrl = (assetId: string | null | undefined, params?: Record<string, string | number | boolean>) => {
  // Handle null/undefined/empty values
  if (!assetId) return '';
  
  const isAbsolute = /^https?:\/\//i.test(assetId);
  const base = isAbsolute ? assetId : `${DIRECTUS_URL}/assets/${assetId}`;
  const usp = new URLSearchParams();
  
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      usp.set(k, String(v));
    }
  }
  
  // Append access token only for Directus-hosted assets (not for external URLs)
  try {
    const directusOrigin = new URL(DIRECTUS_URL).origin;
    const baseOrigin = isAbsolute ? new URL(base).origin : directusOrigin;
    const isDirectusHost = baseOrigin === directusOrigin;
    if (isDirectusHost && DIRECTUS_TOKEN && !usp.has('access_token')) {
      usp.set('access_token', DIRECTUS_TOKEN);
    }
  } catch {
    // if URL parsing fails, skip token injection
  }
  
  const query = usp.toString();
  const finalUrl = query ? `${base}?${query}` : base;
  
  if (import.meta.env.DEV) {
    console.log('[Directus] Asset URL:', finalUrl);
  }
  
  return finalUrl;
};

export const buildSrcSet = (assetId: string | null | undefined, widths: number[], opts?: { format?: 'webp' | 'jpg' | 'png'; quality?: number }) => {
  // Handle null/undefined/empty values
  if (!assetId) return '';
  
  const { format, quality = 80 } = opts || {};
  const isAbsolute = /^https?:\/\//i.test(assetId);
  
  // If it's not a Directus asset id or URL, we can't transform -> no srcset
  if (isAbsolute) {
    try {
      const isDirectus = new URL(assetId).origin === new URL(DIRECTUS_URL).origin;
      if (!isDirectus) return '';
    } catch {
      return '';
    }
  }
  
  return widths
    .map((w) => {
      const url = getDirectusAssetUrl(assetId, {
        width: w,
        quality,
        ...(format ? { format } : {}),
        fit: 'cover',
      });
      return `${url} ${w}w`;
    })
    .join(', ');
};
