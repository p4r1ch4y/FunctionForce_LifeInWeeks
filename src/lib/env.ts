// Environment configuration with validation

export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // AI Services
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || '',
  
  // Optional APIs
  WIKIPEDIA_API_URL: process.env.WIKIPEDIA_API_URL || 'https://en.wikipedia.org/api/rest_v1',
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERCEL_URL: process.env.VERCEL_URL || '',
};

// Validation functions
export function validateSupabaseConfig(): boolean {
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function validateHuggingFaceConfig(): boolean {
  return !!env.HUGGINGFACE_API_KEY;
}

export function getBaseUrl(): string {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:3000';
}

// Configuration status
export function getConfigStatus() {
  return {
    supabase: validateSupabaseConfig(),
    huggingface: validateHuggingFaceConfig(),
    baseUrl: getBaseUrl(),
    environment: env.NODE_ENV,
  };
}

// Safe environment access with fallbacks
export function getEnvVar(key: keyof typeof env, fallback?: string): string {
  const value = env[key];
  if (!value && fallback) {
    console.warn(`Environment variable ${key} not found, using fallback`);
    return fallback;
  }
  return value;
}
