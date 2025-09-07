import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserContext {
  id: string;
  email: string;
  name: string;
}

export class UserBridge {
  static async getCurrentUser(): Promise<UserContext | null> {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) return null;
      
      const session = await response.json();
      if (!session?.user) return null;

      return {
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || ''
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Updated to create user_profiles entry and handle missing users
  static async ensureSupabaseUser(user: UserContext): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return user.id;

    try {
      // Use maybeSingle() instead of single() to avoid 406 errors
      const { data: existingProfile, error: getProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('nextauth_user_id', user.id)
        .maybeSingle(); // This prevents 406 errors

      if (existingProfile && !getProfileError) {
        return user.id; // User exists, return their NextAuth ID
      }

      // Create user profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          nextauth_user_id: user.id,
          email: user.email,
          name: user.name,
          metadata: { created_via: 'nextauth' }
        })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return user.id; // Fallback to NextAuth ID
      }

      return user.id;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return user.id; // Fallback to NextAuth ID
    }
  }

  static async getUserIdForSupabase(): Promise<string | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    return await this.ensureSupabaseUser(user);
  }
}
