import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.services';

export interface UserProfile {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private isDevelopment = false; // Toggle for mock/real (change to false with supabasetest)
    private mockUserId = '00000000-0000-0000-0000-000000000001';
    private mockProfiles: Map<string, UserProfile> = new Map();

    constructor(private supabase: SupabaseService) { }

    async getProfile(userId: string): Promise<UserProfile | null> {
        if (this.isDevelopment) {
            console.log('MOCK: getProfile for', userId);
            return this.mockProfiles.get(userId) || null;
        }

        const { data, error } = await this.supabase.client
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) return null;
        return data as UserProfile;
    }

    async createProfile(profile: UserProfile): Promise<UserProfile | null> {
        if (this.isDevelopment) {
            console.log('MOCK: createProfile', profile);
            const newProfile: UserProfile = {
                ...profile,
                user_id: this.mockUserId,
                created_at: new Date().toISOString(),
            };
            this.mockProfiles.set(this.mockUserId, newProfile);
            return newProfile;
        }


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
            console.error('Profile creation error:', error);
            console.error('Profildata vid fel:', profile);
            return null;
        }
        return data as UserProfile;
    }

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        if (this.isDevelopment) {
            console.log('MOCK: updateProfile', userId, updates);
            const existing = this.mockProfiles.get(userId);
            if (!existing) return null;

            const updated = { ...existing, ...updates };
            this.mockProfiles.set(userId, updated);
            return updated;
        }

        // Real Supabase
        const { data, error } = await this.supabase.client
            .from('profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) return null;
        return data as UserProfile;
    }

    // Toggle between mock and real mode
    setDevelopmentMode(isDev: boolean) {
        this.isDevelopment = isDev;
        console.log(isDev ? 'Development mode ON (mock)' : 'Production mode ON (real Supabase)');
    }
}
