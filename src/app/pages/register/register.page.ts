import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    standalone: true,
    imports: [ReactiveFormsModule],
})
export class RegisterPage {
    registerForm: FormGroup;
    submitted = false;

    constructor(private fb: FormBuilder) {
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

    onSubmit() {
        this.submitted = true;
        if (this.registerForm.valid) {
            // Handle register here
            console.log('Registration data:', this.registerForm.value);
        }
    }
}
