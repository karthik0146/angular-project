import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
        return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    hidePassword = true;
    hideConfirmPassword = true;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            acceptTerms: [false, [Validators.requiredTrue]]
        }, { validators: passwordMatchValidator });

        // Add custom validator to confirmPassword field
        this.registerForm.get('confirmPassword')?.setValidators([
            Validators.required,
            this.confirmPasswordValidator.bind(this)
        ]);
    }

    confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
        const password = this.registerForm?.get('password')?.value;
        const confirmPassword = control.value;
        
        if (password && confirmPassword && password !== confirmPassword) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit(): void {
        if (this.registerForm.valid && !this.isLoading) {
            this.isLoading = true;
            
            const { name, email, password } = this.registerForm.value;
            const registerData = { name, email, password };
            
            this.authService.register(registerData).subscribe({
                next: () => {
                    alert('Account created successfully! Welcome to EXTrace!');
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.isLoading = false;
                    alert(error.error.error || 'Registration failed. Please try again.');
                }
            });
        } else {
            // Show validation errors
            this.markFormGroupTouched();
        }
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    registerWithGoogle(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.authService.initiateGoogleLogin();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            control?.markAsTouched();
        });
    }
}