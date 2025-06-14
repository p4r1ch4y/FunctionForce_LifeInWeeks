// Comprehensive connection testing for LifeWeeks application

import { createClient } from './supabase-client';
import { analyzeSentiment, generateNarrative, generateArtPrompt } from './ai';
import { env, validateSupabaseConfig, validateHuggingFaceConfig } from './env';

export interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

export interface TestSuite {
  environment: TestResult[];
  database: TestResult[];
  ai: TestResult[];
  integration: TestResult[];
}

// Environment Tests
export async function testEnvironmentConfig(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test Supabase configuration
  results.push({
    name: 'Supabase Configuration',
    status: validateSupabaseConfig() ? 'success' : 'error',
    message: validateSupabaseConfig() 
      ? 'Supabase URL and anon key are configured'
      : 'Missing Supabase URL or anon key',
    details: {
      hasUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlLength: env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
    }
  });

  // Test Hugging Face configuration
  results.push({
    name: 'Hugging Face Configuration',
    status: validateHuggingFaceConfig() ? 'success' : 'warning',
    message: validateHuggingFaceConfig()
      ? 'Hugging Face API key is configured'
      : 'Missing Hugging Face API key - AI features will use fallbacks',
    details: {
      hasApiKey: !!env.HUGGINGFACE_API_KEY,
      keyLength: env.HUGGINGFACE_API_KEY?.length || 0
    }
  });

  return results;
}

// Database Connection Tests
export async function testDatabaseConnection(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const supabase = createClient();

  // Test basic connection
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const duration = Date.now() - startTime;

    results.push({
      name: 'Database Connection',
      status: error ? 'error' : 'success',
      message: error ? `Connection failed: ${error.message}` : 'Successfully connected to database',
      duration,
      details: { error: error?.message }
    });
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'error',
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    });
  }

  // Test table existence
  const tables = ['users', 'personal_events'];
  for (const table of tables) {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from(table).select('*').limit(1);
      const duration = Date.now() - startTime;

      results.push({
        name: `Table: ${table}`,
        status: error ? 'error' : 'success',
        message: error ? `Table access failed: ${error.message}` : `Table ${table} is accessible`,
        duration,
        details: { table, error: error?.message }
      });
    } catch (error) {
      results.push({
        name: `Table: ${table}`,
        status: 'error',
        message: `Table error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { table, error }
      });
    }
  }

  return results;
}

// Authentication Tests
export async function testAuthentication(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const supabase = createClient();

  try {
    const startTime = Date.now();
    const { data: { session }, error } = await supabase.auth.getSession();
    const duration = Date.now() - startTime;

    results.push({
      name: 'Authentication Check',
      status: error ? 'error' : (session ? 'success' : 'warning'),
      message: error 
        ? `Auth error: ${error.message}`
        : session 
          ? `Authenticated as: ${session.user.email}`
          : 'No active session (not logged in)',
      duration,
      details: { 
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message 
      }
    });
  } catch (error) {
    results.push({
      name: 'Authentication Check',
      status: 'error',
      message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    });
  }

  return results;
}

// AI Module Tests
export async function testAIModules(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test sentiment analysis
  const testTexts = [
    { text: 'I am so happy and excited about this amazing opportunity!', expected: 'positive' },
    { text: 'This is terrible and makes me very sad and angry.', expected: 'negative' },
    { text: 'I went to the store and bought some groceries.', expected: 'neutral' }
  ];

  for (const { text, expected } of testTexts) {
    try {
      const startTime = Date.now();
      const sentiment = await analyzeSentiment(text);
      const duration = Date.now() - startTime;

      results.push({
        name: `Sentiment Analysis (${expected})`,
        status: sentiment === expected ? 'success' : 'warning',
        message: `Input: "${text.substring(0, 30)}..." → Detected: ${sentiment}`,
        duration,
        details: { input: text, expected, actual: sentiment }
      });
    } catch (error) {
      results.push({
        name: `Sentiment Analysis (${expected})`,
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { input: text, expected, error }
      });
    }
  }

  // Test narrative generation
  try {
    const startTime = Date.now();
    const narrative = await generateNarrative(
      'Started my first job as a software developer',
      'iPhone was launched by Apple'
    );
    const duration = Date.now() - startTime;

    results.push({
      name: 'Narrative Generation',
      status: narrative.length > 20 ? 'success' : 'warning',
      message: `Generated ${narrative.length} character narrative`,
      duration,
      details: { narrative: narrative.substring(0, 100) + '...' }
    });
  } catch (error) {
    results.push({
      name: 'Narrative Generation',
      status: 'error',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    });
  }

  // Test art prompt generation
  try {
    const startTime = Date.now();
    const artPrompt = await generateArtPrompt([
      'Started first job: Excited about new career (positive)',
      'Graduated college: Proud achievement (positive)',
      'Moved to new city: Big life change (neutral)'
    ]);
    const duration = Date.now() - startTime;

    results.push({
      name: 'Art Prompt Generation',
      status: artPrompt.length > 30 ? 'success' : 'warning',
      message: `Generated ${artPrompt.length} character art prompt`,
      duration,
      details: { prompt: artPrompt.substring(0, 100) + '...' }
    });
  } catch (error) {
    results.push({
      name: 'Art Prompt Generation',
      status: 'error',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    });
  }

  return results;
}

// API Endpoint Tests
export async function testAPIEndpoints(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const endpoints = [
    { name: 'Historical Events', path: '/api/historical-events' },
    { name: 'Seed Data Status', path: '/api/seed-data' },
    { name: 'Generate Art Styles', path: '/api/generate-art' }
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.path);
      const duration = Date.now() - startTime;

      results.push({
        name: endpoint.name,
        status: response.ok ? 'success' : 'error',
        message: `${endpoint.path} → ${response.status} ${response.statusText}`,
        duration,
        details: { 
          status: response.status, 
          statusText: response.statusText,
          url: endpoint.path 
        }
      });
    } catch (error) {
      results.push({
        name: endpoint.name,
        status: 'error',
        message: `Failed to reach ${endpoint.path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { url: endpoint.path, error }
      });
    }
  }

  return results;
}

// Integration Tests
export async function testIntegration(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const supabase = createClient();

  // Test full event creation flow
  try {
    const startTime = Date.now();
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      results.push({
        name: 'Event Creation Flow',
        status: 'warning',
        message: 'Cannot test event creation - no authenticated user',
        details: { reason: 'No active session' }
      });
    } else {
      // Test event creation (we'll delete it after)
      const testEvent = {
        user_id: session.user.id,
        title: 'Test Event - Integration Test',
        description: 'This is a test event created during integration testing',
        date: new Date().toISOString(),
        category: 'Personal',
        sentiment: 'neutral'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('personal_events')
        .insert([testEvent])
        .select();

      if (insertError) {
        results.push({
          name: 'Event Creation Flow',
          status: 'error',
          message: `Event creation failed: ${insertError.message}`,
          details: { error: insertError }
        });
      } else {
        // Clean up - delete the test event
        if (insertData && insertData.length > 0) {
          await supabase
            .from('personal_events')
            .delete()
            .eq('id', insertData[0].id);
        }

        const duration = Date.now() - startTime;
        results.push({
          name: 'Event Creation Flow',
          status: 'success',
          message: 'Successfully created and cleaned up test event',
          duration,
          details: { eventId: insertData[0]?.id }
        });
      }
    }
  } catch (error) {
    results.push({
      name: 'Event Creation Flow',
      status: 'error',
      message: `Integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    });
  }

  return results;
}

// Run all tests
export async function runAllTests(): Promise<TestSuite> {
  console.log('🧪 Starting comprehensive connection tests...');

  const [environment, database, ai, integration] = await Promise.all([
    testEnvironmentConfig(),
    testDatabaseConnection(),
    testAIModules(),
    testIntegration()
  ]);

  // Also test authentication
  const auth = await testAuthentication();
  database.push(...auth);

  // Also test API endpoints
  const api = await testAPIEndpoints();
  integration.push(...api);

  return {
    environment,
    database,
    ai,
    integration
  };
}
