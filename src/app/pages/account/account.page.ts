import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionPersonCircleOutline, ionLogOutOutline, ionPersonOutline } from '@ng-icons/ionicons';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.services';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  providers: [provideIcons({ ionPersonCircleOutline, ionLogOutOutline, ionPersonOutline })]
})
export class AccountPage implements OnInit {
  profileForm!: FormGroup;
  addressForm!: FormGroup;
  showSuccess = false;
  successMessage = '';

  // Properties for profile view
  profileAvatarUrl: string | undefined;
  profileCreatedAt: string | undefined;

  profileLoaded = false;
  profileError = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForms(); // Initialize forms
  }

  async ngOnInit(): Promise<void> {

    // Check authentication (Supabase)
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
  }

  // Initialize the profile and address forms with default values and validators
  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['John', [Validators.required, Validators.minLength(2)]],
      lastName: ['Doe', [Validators.required, Validators.minLength(2)]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+46\s?\d{1,3}\s?\d{2,3}\s?\d{2}\s?\d{2}$/)]],
      avatar: ['']
    });

    this.addressForm = this.fb.group({
      street: ['Storgatan 10', [Validators.required, Validators.minLength(5)]],
      city: ['Stockholm', [Validators.required, Validators.minLength(2)]],
      zipCode: ['123 45', [Validators.required, Validators.pattern(/^\d{3}\s?\d{2}$/)]]
    });
  }

  // Loads the user profile from Supabase and updates the form and view
  private async loadUserProfile(): Promise<void> {
    // Get logged in user
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Get profile for logged in user
    const profile = await this.profileService.getProfile(user.id);
    if (profile) {
      this.profileForm.patchValue({
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        avatar: profile.avatar_url || ''
      });
      this.profileAvatarUrl = profile.avatar_url || '';
      this.profileCreatedAt = profile.created_at;
      this.profileLoaded = true;
      this.profileError = false;
      this.cdr.detectChanges();
    } else {
      this.profileLoaded = true;
      this.profileError = true;
      this.cdr.detectChanges();
    }
  }

  // Save changes to the user profile in Supabase
  async saveProfileChanges(): Promise<void> {
    if (this.profileForm.valid) {
      const { firstName, lastName, email, phone, avatar } = this.profileForm.value;
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      if (!user) return;
      const updates = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        avatar_url: avatar
      };
      await this.profileService.updateProfile(user.id, updates);
      this.profileAvatarUrl = avatar;
      this.showSuccessMessage('Profile updated successfully');
      setTimeout(() => {
        this.profileForm.markAsPristine();
      }, 500);
    }
  }

  // Save changes to the shipping address
  saveAddress(): void {
    if (this.addressForm.valid) {
      this.showSuccessMessage('Shipping address updated successfully');
      setTimeout(() => {
        this.addressForm.markAsPristine();
      }, 500);
    }
  }

  // Show a temporary success message
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  // Sign out the user and redirect to login
  async signOut(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    window.location.href = '/login';
  }

  // Returns true if the profile form is dirty (changed) and valid
  get isProfileDirty(): boolean {
    return this.profileForm.dirty && this.profileForm.valid;
  }

  // Returns true if the address form is dirty (changed) and valid
  get isAddressDirty(): boolean {
    return this.addressForm.dirty && this.addressForm.valid;
  }
}