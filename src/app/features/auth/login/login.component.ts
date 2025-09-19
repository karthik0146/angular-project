import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule
    ],
    template: `
        <div class="login-container">
            <div class="login-card">
                <h2>Login</h2>
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                    <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input matInput type="email" formControlName="email">
                        <mat-error *ngIf="loginForm.get('email')?.errors?.['required']">
                            Email is required
                        </mat-error>
                        <mat-error *ngIf="loginForm.get('email')?.errors?.['email']">
                            Please enter a valid email
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Password</mat-label>
                        <input matInput type="password" formControlName="password">
                        <mat-error *ngIf="loginForm.get('password')?.errors?.['required']">
                            Password is required
                        </mat-error>
                    </mat-form-field>

                    <div class="button-container">
                        <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">
                            Login
                        </button>
                        <button mat-button type="button" (click)="goToRegister()">
                            Create Account
                        </button>
                    </div>
                </form>

                <div class="divider">
                    <span>or</span>
                </div>

                <div class="social-login">
                    <button mat-stroked-button class="google-btn" (click)="loginWithGoogle()">
                        <img src="assets/google-logo.svg" alt="Google" class="google-icon">
                        <span>Continue with Google</span>
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f5f5f5;
        }

        .login-card {
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 2rem;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        mat-form-field {
            width: 100%;
        }

        .button-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
        }

        .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 2rem 0;

            &::before,
            &::after {
                content: '';
                flex: 1;
                border-bottom: 1px solid #e0e0e0;
            }

            span {
                padding: 0 1rem;
                color: #666;
                font-size: 0.9rem;
            }
        }

        .social-login {
            display: flex;
            justify-content: center;

            .google-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 16px;
                height: 40px;
                border: 1px solid #dadce0;
                border-radius: 4px;
                background-color: white;
                color: #3c4043;
                font-weight: 500;
                
                &:hover {
                    background-color: #f8f9fa;
                }

                .google-icon {
                    width: 18px;
                    height: 18px;
                }

                span {
                    margin-left: 8px;
                }
            }
        }
    `]
})
export class LoginComponent {
    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error.error || 'Login failed',
                        'Close',
                        { duration: 3000 }
                    );
                }
            });
        }
    }

    goToRegister(): void {
        this.router.navigate(['/auth/register']);
    }

    loginWithGoogle(): void {
        this.authService.initiateGoogleLogin();
    }
}