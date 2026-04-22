import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.services';

// Interface describing the structure of a user profile in the database
export interface UserProfile {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    created_at?: string;
}

// Service for CRUD operations on user profiles in Supabase
@Injectable({ providedIn: 'root' })
export class ProfileService {
    // Inject the Supabase service for database access
    constructor(private supabase: SupabaseService) { }

    // Fetch a user profile by user ID
    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await this.supabase.client
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) return null;
        return data as UserProfile;
    }

    // Create a new user profile
    async createProfile(profile: UserProfile): Promise<UserProfile | null> {
        const { data, error } = await this.supabase.client
            .from('profiles')
            .insert([
                {
                    user_id: profile.user_id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    email: profile.email,
                }
            ])
            .select()
            .single();

        if (error) {
            return null;
        }
        return data as UserProfile;
    }

    // Update an existing user profile by user ID
    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        const { data, error } = await this.supabase.client
            .from('profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) return null;
        return data as UserProfile;
    }
}
