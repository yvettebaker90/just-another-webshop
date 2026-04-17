import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SupabaseService } from '../../services/supabase.services';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    error: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private supabaseService: SupabaseService
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit(): void {
        this.title.setTitle('Sign In | Just Another Webshop');
        this.meta.updateTag({
            name: 'description',
            content: 'Sign in to your Just Another Webshop account to manage your profile, wishlist, and shopping cart.',
        });
    }

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    async onSubmit(): Promise<void> {
        this.submitted = true;
        this.error = null;

        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        const { email, password } = this.loginForm.value;

        // Supabase Auth signIn
        const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            this.error = 'Invalid email or password';
            this.loading = false;
            return;
        }

        // Login success, navigate to account-page
        this.router.navigate(['/account']);
        this.loading = false;
    }

    navigateToSignup(): void {
        this.router.navigate(['/signup']);
    }
}
