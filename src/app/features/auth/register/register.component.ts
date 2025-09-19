import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    template: `
        <div class="register-container">
            <div class="register-card">
                <h2>Create Account</h2>
                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                    <mat-form-field appearance="outline">
                        <mat-label>Name</mat-label>
                        <input matInput type="text" formControlName="name">
                        <mat-error *ngIf="registerForm.get('name')?.errors?.['required']">
                            Name is required
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input matInput type="email" formControlName="email">
                        <mat-error *ngIf="registerForm.get('email')?.errors?.['required']">
                            Email is required
                        </mat-error>
                        <mat-error *ngIf="registerForm.get('email')?.errors?.['email']">
                            Please enter a valid email
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Password</mat-label>
                        <input matInput type="password" formControlName="password">
                        <mat-error *ngIf="registerForm.get('password')?.errors?.['required']">
                            Password is required
                        </mat-error>
                        <mat-error *ngIf="registerForm.get('password')?.errors?.['minlength']">
                            Password must be at least 6 characters
                        </mat-error>
                    </mat-form-field>

                    <div class="button-container">
                        <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid">
                            Register
                        </button>
                        <button mat-button type="button" (click)="goToLogin()">
                            Already have an account?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `,
    styles: [`
        .register-container {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f5f5f5;
        }

        .register-card {
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
    `]
})
export class RegisterComponent {
    registerForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error.error || 'Registration failed',
                        'Close',
                        { duration: 3000 }
                    );
                }
            });
        }
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }
}