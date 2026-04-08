import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.services';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
})
export class RegisterPage {
    registerForm: FormGroup;
    submitted = false;
    error: string | null = null;
    success: string | null = null;

    constructor(
        private fb: FormBuilder,
        private supabaseService: SupabaseService,
        private profileService: ProfileService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordsMatchValidator });
    }

    get firstName() { return this.registerForm.get('firstName'); }
    get lastName() { return this.registerForm.get('lastName'); }
    get email() { return this.registerForm.get('email'); }
    get password() { return this.registerForm.get('password'); }
    get confirmPassword() { return this.registerForm.get('confirmPassword'); }

    passwordsMatchValidator(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordsMismatch: true };
    }

    async onSubmit() {
        console.log('submit!');
        this.submitted = true;
        this.error = null;
        this.success = null;
        if (this.registerForm.valid) {
            const { firstName, lastName, email, password } = this.registerForm.value;
            // Create user with Supabase Auth
            const { data, error } = await this.supabaseService.client.auth.signUp({
                email,
                password,
            });
            console.log('signUp result:', { data, error });
            const user = data.user;
            console.log('user:', user);
            if (error) {
                this.error = error.message;
                return;
            }
            if (!user || !user.id) {
                this.error = 'Registreringen misslyckades, försök igen.';
                return;
            }

            // Create profile in profiles-table
            const profile = await this.profileService.createProfile({
                user_id: user.id,
                first_name: firstName,
                last_name: lastName,
                email,
            });
            console.log('createProfile result:', profile);
            if (!profile) {
                this.error = 'Failed to create profile. Kontakta support.';
                return;
            }
            this.success = 'Registration successful! Redirecting...';
            setTimeout(() => {
                this.router.navigate(['/account']);
            }, 1000);
            this.registerForm.reset();
            this.submitted = false;
        }
    }
}