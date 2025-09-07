import { supabase } from './client';
import { UserBridge } from '@/lib/auth/user-bridge';

/**
 * Middleware to set user context for Supabase RLS policies
 */
export class SupabaseMiddleware {
  // Set user context for RLS policies
  static async setUserContext(): Promise<void> {
    if (!supabase) return;

    try {
      const userId = await UserBridge.getUserIdForSupabase();
      
      if (userId) {
        // Set the user ID for RLS policies using a simpler approach
        const { error } = await supabase.rpc('set_config', {
          setting_name: 'app.current_user_id',
          setting_value: userId,
          is_local: true
        });

        if (error) {
          console.warn('Could not set user context via RLS, continuing without:', error.message);
        }
      }
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  }

  // Execute a function with user context set
  static async withUserContext<T>(operation: () => Promise<T>): Promise<T> {
    await this.setUserContext();
    return await operation();
  }
}
