import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    error: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit(): void { }

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    onSubmit(): void {
        this.submitted = true;
        this.error = null;

        // Stop if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;

        // Simulate API-call
        setTimeout(() => {
            const { email, password } = this.loginForm.value;

            // Replace with API-call (Supabase)
            console.log('Login attempt:', { email, password });

            // Example: Navigate to account-page if success
            // this.router.navigate(['/account']);

            // Example: Show errors
            // this.error = 'Invalid email or password';

            this.loading = false;
        }, 1500);
    }

    navigateToSignup(): void {
        this.router.navigate(['/signup']);
    }
}