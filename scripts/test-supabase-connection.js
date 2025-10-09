/**
 * Test Supabase Connection Script
 * 
 * This script tests the connection to Supabase and diagnoses common issues.
 * Run with: node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('Configuration:');
console.log('- URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('- Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    console.log('');
    
    console.log('2️⃣ Testing auth service...');
    
    // Test if we can access auth API
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'invalid'
      });
      
      // We expect this to fail with invalid credentials, not a 500 error
      if (authError) {
        if (authError.status === 500) {
          console.error('❌ Auth service returning 500 error!');
          console.error('This indicates a server-side issue with your Supabase project.');
          console.error('');
          console.error('Possible causes:');
          console.error('1. Database migrations not applied');
          console.error('2. Auth schema not properly initialized');
          console.error('3. Database connection issues');
          console.error('4. Supabase service outage');
          console.error('');
          console.error('Error details:', authError);
          return false;
        } else if (authError.message.includes('Invalid login credentials')) {
          console.log('✅ Auth service is responding correctly (invalid credentials expected)');
        } else {
          console.log('⚠️  Auth service responded with:', authError.message);
        }
      }
    } catch (err) {
      console.error('❌ Auth service test failed:', err.message);
      return false;
    }
    
    console.log('');
    console.log('3️⃣ Testing database connection...');
    
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (dbError) {
        if (dbError.code === '42P01') {
          console.log('⚠️  Users table does not exist yet');
        } else {
          console.log('⚠️  Database query returned:', dbError.message);
        }
      } else {
        console.log('✅ Database connection successful');
      }
    } catch (err) {
      console.log('⚠️  Database test skipped:', err.message);
    }
    
    console.log('');
    console.log('✅ Connection tests completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Check Supabase Dashboard: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.log('2. Verify Auth is enabled in Authentication settings');
    console.log('3. Check Auth logs for detailed error messages');
    console.log('4. Ensure database migrations are applied');
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
