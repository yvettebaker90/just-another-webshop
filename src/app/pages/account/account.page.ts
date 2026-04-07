import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionPersonCircleOutline, ionLogOutOutline, ionPersonOutline } from '@ng-icons/ionicons';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, NgIcon],
  providers: [provideIcons({ ionPersonCircleOutline, ionLogOutOutline, ionPersonOutline })]
})
export class AccountPage implements OnInit {
  profileForm!: FormGroup;
  addressForm!: FormGroup;
  showSuccess = false;
  successMessage = '';

  // Mock user data
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: '2025-01-15',
    avatar: 'assets/avatar.jpg'
  };

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private initializeForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      firstName: ['John', [Validators.required, Validators.minLength(2)]],
      lastName: ['Doe', [Validators.required, Validators.minLength(2)]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['+46 70 123 45 67', [Validators.required, Validators.pattern(/^\+46\s?\d{1,3}\s?\d{2,3}\s?\d{2}\s?\d{2}$/)]]
    });

    // Shipping address form
    this.addressForm = this.fb.group({
      street: ['Storgatan 10', [Validators.required, Validators.minLength(5)]],
      city: ['Stockholm', [Validators.required, Validators.minLength(2)]],
      zipCode: ['123 45', [Validators.required, Validators.pattern(/^\d{3}\s?\d{2}$/)]]
    });
  }

  private loadUserProfile(): void {
    // Fetch from Supabase later instead of mock data
  }

  saveProfileChanges(): void {
    if (this.profileForm.valid) {
      // Simulate API call
      console.log('Saving profile:', this.profileForm.value);
      this.showSuccessMessage('Profile updated successfully');
      
      // Reset form to mark it as pristine
      setTimeout(() => {
        this.profileForm.markAsPristine();
      }, 500);
    }
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      // Simulate API call
      console.log('Saving address:', this.addressForm.value);
      this.showSuccessMessage('Shipping address updated successfully');
      
      // Reset form to mark it as pristine
      setTimeout(() => {
        this.addressForm.markAsPristine();
      }, 500);
    }
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;

    // Hide message after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  signOut(): void {
    console.log('Signing out...');
    // Call an auth service later
    // this.authService.logout();
  }

  get isProfileDirty(): boolean {
    return this.profileForm.dirty && this.profileForm.valid;
  }

  get isAddressDirty(): boolean {
    return this.addressForm.dirty && this.addressForm.valid;
  }
}