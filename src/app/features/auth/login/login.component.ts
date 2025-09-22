import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    hidePassword = true;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid && !this.isLoading) {
            this.isLoading = true;
            
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    const { rememberMe } = this.loginForm.value;
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('rememberMe');
                    }
                    
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.isLoading = false;
                    alert(error.error.error || 'Login failed. Please check your credentials.');
                }
            });
        } else {
            // Show validation errors
            this.markFormGroupTouched();
        }
    }

    goToRegister(): void {
        this.router.navigate(['/auth/register']);
    }

    loginWithGoogle(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.authService.initiateGoogleLogin();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }
}