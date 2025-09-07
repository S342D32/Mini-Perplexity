import { UserBridge } from '@/lib/auth/user-bridge';
import { SupabaseChatService } from '@/lib/services/supabaseChatService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Test utility to verify Supabase integration and user ID retrieval
 */
export class SupabaseIntegrationTest {
  static async runDiagnostics(): Promise<{
    success: boolean;
    results: Record<string, any>;
    errors: string[];
  }> {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    console.log('🔍 Running Supabase Integration Diagnostics...\n');

    // Test 1: Check Supabase configuration
    try {
      results.supabaseConfigured = isSupabaseConfigured;
      console.log(`✅ Supabase Configuration: ${isSupabaseConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
      
      if (!isSupabaseConfigured) {
        errors.push('Supabase environment variables not set');
      }
    } catch (error) {
      errors.push(`Supabase config check failed: ${error}`);
    }

    // Test 2: Check user authentication
    try {
      const user = await UserBridge.getCurrentUser();
      results.currentUser = user;
      console.log(`👤 Current User: ${user ? `${user.name} (${user.email})` : 'NOT AUTHENTICATED'}`);
      
      if (!user) {
        errors.push('User not authenticated');
      }
    } catch (error) {
      errors.push(`User authentication check failed: ${error}`);
    }

    // Test 3: Check user ID for Supabase
    try {
      const userId = await UserBridge.getUserIdForSupabase();
      results.supabaseUserId = userId;
      console.log(`🔑 Supabase User ID: ${userId || 'NULL'}`);
      
      if (!userId) {
        errors.push('Unable to get user ID for Supabase operations');
      }
    } catch (error) {
      errors.push(`Supabase user ID retrieval failed: ${error}`);
    }

    // Test 4: Test session creation
    if (isSupabaseConfigured && results.supabaseUserId) {
      try {
        const testSession = await SupabaseChatService.createNewSession('Test Session');
        results.testSession = testSession;
        console.log(`💬 Test Session Created: ${testSession.id}`);
        
        // Clean up test session
        if (testSession.id.startsWith('mock-')) {
          console.log('📝 Mock session created (Supabase not fully configured)');
        } else {
          await SupabaseChatService.deleteSession(testSession.id);
          console.log('🗑️ Test session cleaned up');
        }
      } catch (error) {
        errors.push(`Session creation test failed: ${error}`);
      }
    }

    // Test 5: Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    results.environmentVariables = envVars;
    console.log('🔧 Environment Variables:', envVars);

    const success = errors.length === 0;
    
    console.log(`\n${success ? '✅ ALL TESTS PASSED' : '❌ ISSUES FOUND'}`);
    if (errors.length > 0) {
      console.log('\n🚨 Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    return { success, results, errors };
  }
}
