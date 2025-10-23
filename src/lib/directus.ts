const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://strandly.onrender.com';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '';

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
  // Use server-side proxy to avoid CORS issues
  let proxyUrl = `/api${endpoint}`;
  if (DIRECTUS_TOKEN) {
    try {
      const url = new URL(proxyUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      if (!url.searchParams.has('access_token')) {
        url.searchParams.set('access_token', DIRECTUS_TOKEN);
      }
      proxyUrl = url.pathname + url.search;
    } catch {
      // noop
    }
  }
  if (import.meta.env.DEV) {
    console.log('[Directus] Proxy request →', proxyUrl);
    console.log('[Directus] Token available:', !!DIRECTUS_TOKEN);
    console.log('[Directus] Token preview:', DIRECTUS_TOKEN ? `${DIRECTUS_TOKEN.substring(0, 10)}...` : 'none');
  }
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      let message = 'Failed to fetch data from Directus';
      let details: unknown = undefined;
      try {
        details = await response.json();
        // @ts-expect-error best-effort message extraction
        message = details?.errors?.[0]?.message || message;
      } catch (_e) {
        // ignore JSON parse error
      }
      throw new DirectusFetchError(message, { status: response.status, endpoint, url: proxyUrl, details });
    }

    return response.json();
  } catch (error) {
    console.error('[Directus] Proxy error', error);
    
    // Fallback to direct API call
    try {
      console.log('[Directus] Falling back to direct API call...');
      let directUrl = `${DIRECTUS_URL}${endpoint}`;
      if (DIRECTUS_TOKEN) {
        try {
          const url = new URL(directUrl);
          if (!url.searchParams.has('access_token')) {
            url.searchParams.set('access_token', DIRECTUS_TOKEN);
          }
          directUrl = url.toString();
        } catch {
          // noop
        }
      }
      
      const response = await fetch(directUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        let message = 'Failed to fetch data from Directus (direct)';
        let details: unknown = undefined;
        try {
          details = await response.json();
          // @ts-expect-error best-effort
          message = details?.errors?.[0]?.message || message;
        } catch (_e) {
          // ignore
        }
        throw new DirectusFetchError(message, { status: response.status, endpoint, url: directUrl, details });
      }

      return response.json();
    } catch (directError) {
      console.error('[Directus] Direct call failed', directError);
      throw directError;
    }
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