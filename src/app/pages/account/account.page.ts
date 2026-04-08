import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionPersonCircleOutline, ionLogOutOutline, ionPersonOutline } from '@ng-icons/ionicons';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.services';

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
  private isDevelopment = true; // ← Toggle between mock/real
  private mockUserId = '00000000-0000-0000-0000-000000000001';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeForms();
  }

  async ngOnInit(): Promise<void> {
    if (this.isDevelopment) {
      console.log('MOCK: Loaded account page (skipped auth check)');
      this.loadUserProfile();
      return;
    }

    // Real auth check
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['John', [Validators.required, Validators.minLength(2)]],
      lastName: ['Doe', [Validators.required, Validators.minLength(2)]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['+46 70 123 45 67', [Validators.required, Validators.pattern(/^\+46\s?\d{1,3}\s?\d{2,3}\s?\d{2}\s?\d{2}$/)]]
    });

    this.addressForm = this.fb.group({
      street: ['Storgatan 10', [Validators.required, Validators.minLength(5)]],
      city: ['Stockholm', [Validators.required, Validators.minLength(2)]],
      zipCode: ['123 45', [Validators.required, Validators.pattern(/^\d{3}\s?\d{2}$/)]]
    });
  }

  private loadUserProfile(): void {
    if (this.isDevelopment) {
      console.log('MOCK: Loaded profile for user:', this.mockUserId);
      return;
    }

    // Real profile loading from Supabase
    // const profile = await this.profileService.getProfile(this.mockUserId);
    // if (profile) {
    //   this.profileForm.patchValue({
    //     firstName: profile.first_name,
    //     lastName: profile.last_name,
    //     email: profile.email,
    //   });
    // }
  }

  saveProfileChanges(): void {
    if (this.profileForm.valid) {
      console.log('Saving profile:', this.profileForm.value);
      this.showSuccessMessage('Profile updated successfully');

      setTimeout(() => {
        this.profileForm.markAsPristine();
      }, 500);
    }
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      console.log('Saving address:', this.addressForm.value);
      this.showSuccessMessage('Shipping address updated successfully');

      setTimeout(() => {
        this.addressForm.markAsPristine();
      }, 500);
    }
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;

    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  async signOut(): Promise<void> {
    if (this.isDevelopment) {
      console.log('MOCK: Signed out');
      this.router.navigate(['/login']);
      return;
    }

    // Real sign out
    await this.supabaseService.client.auth.signOut();
    window.location.href = '/login';
  }

  get isProfileDirty(): boolean {
    return this.profileForm.dirty && this.profileForm.valid;
  }

  get isAddressDirty(): boolean {
    return this.addressForm.dirty && this.addressForm.valid;
  }
}