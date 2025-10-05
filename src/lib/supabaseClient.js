// src/lib/supabaseClient.js - SINGLETON INSTANCE
import { createClient } from '@supabase/supabase-js';
import { Logger } from '../services/logger';

// Check for required environment variables (support new Supabase key system)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY).');
}

// Session cache to avoid repeated requests
let sessionCache = {
  session: null,
  timestamp: null,
  ttl: 60000 // 60 seconds TTL for better performance
};

const getCachedSession = async () => {
  const now = Date.now();

  // Check if we have a valid cached session
  if (sessionCache.session && sessionCache.timestamp &&
      (now - sessionCache.timestamp) < sessionCache.ttl) {
    return sessionCache.session;
  }

  try {
    const { data: { session } } = await supabaseInstance.auth.getSession();

    // Cache the session
    sessionCache.session = session;
    sessionCache.timestamp = now;

    return session;
  } catch (error) {
    // Clear cache on error
    sessionCache.session = null;
    sessionCache.timestamp = null;
    return null;
  }
};

const clearSessionCache = () => {
  sessionCache.session = null;
  sessionCache.timestamp = null;
};

// Enhanced fetch with better error handling and retry logic
const customFetch = async (url, options = {}) => {
  const maxRetries = 3;
  let lastError;
  let lastResponse;

  const isAbsoluteUrl = url.startsWith('http');
  const fullUrl = isAbsoluteUrl ? url : `${supabaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  // Ensure we have the necessary headers
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('apikey', supabaseAnonKey);

  // Note: Removed session handling as Supabase client manages auth internally

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        // Temporarily disable credentials for development
        credentials: 'omit',
      });

      lastResponse = response;

      // If the request was successful, return the response
      if (response.ok) {
        return response;
      }

      // Handle specific status codes
      const responseData = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const jsonData = responseData ? JSON.parse(responseData) : {};
        errorMessage = jsonData.error?.message || jsonData.message || errorMessage;
      } catch (e) {
        // Not JSON, use text as is
        errorMessage = responseData || errorMessage;
      }

      // If we get a 401, try to refresh the token
      if (response.status === 401) {
        try {
          // Let Supabase handle token refresh automatically
          const { data: { session: newSession }, error: refreshError } = await supabaseInstance.auth.refreshSession();
          if (!refreshError && newSession?.access_token) {
            headers.set('Authorization', `Bearer ${newSession.access_token}`);
            continue; // Retry with new token
          }
        } catch (refreshError) {
          // Ignore refresh errors here; will surface below if retries are exhausted
        }
      }

      // For client errors (4xx), don't retry except for 429 (Too Many Requests)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(errorMessage);
      }

      // For server errors (5xx) or rate limiting (429), implement exponential backoff
      const retryAfter = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryAfter));
      }

    } catch (error) {
      lastError = error;

      // If this was the last attempt, rethrow the error
      if (attempt === maxRetries - 1) {
        const errorToThrow = new Error(error.message || 'Unknown network error');
        errorToThrow.status = lastResponse?.status;
        errorToThrow.response = lastResponse;
        throw errorToThrow;
      }

      // Wait before retrying (exponential backoff with jitter)
      const jitter = Math.random() * 1000; // Add some randomness to prevent thundering herd
      const delay = Math.min(1000 * Math.pow(2, attempt) + jitter, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const error = new Error(lastError?.message || 'Unknown network error');
  error.status = lastResponse?.status;
  error.response = lastResponse;
  throw error;
};

// Singleton pattern to avoid multiple instances
let supabaseInstance = null;

function createSupabaseInstance() {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    global: {
      // This helps prevent multiple instances
      fetch: customFetch,
    }
  };

  // Create the Supabase client
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, options);
  
  // Add auth state change listener to clear cache on sign out
  supabaseInstance.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      clearSessionCache();
    }
  });

  return supabaseInstance;
}

// Create and export the singleton instance
export const supabase = (() => {
  try {
    return createSupabaseInstance();
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    throw error;
  }
})();

// Export the session cache utilities
export { clearSessionCache, getCachedSession };
