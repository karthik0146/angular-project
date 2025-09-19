import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsService, UserSettings } from '../../../core/services/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatSelectModule
    ],
    template: `
        <div class="settings-container">
            <mat-card>
                <mat-card-header>
                    <mat-card-title>User Settings</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
                        <mat-form-field>
                            <mat-label>Display Name</mat-label>
                            <input matInput 
                                   type="text" 
                                   formControlName="displayName" 
                                   placeholder="Enter your display name">
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Currency</mat-label>
                            <mat-select formControlName="currency">
                                <mat-option *ngFor="let currency of currencies" 
                                          [value]="currency.code">
                                    {{currency.code}} ({{currency.symbol}}) - {{currency.name}}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field>
                            <mat-label>Theme</mat-label>
                            <mat-select formControlName="theme">
                                <mat-option *ngFor="let theme of themes" 
                                          [value]="theme.value">
                                    {{theme.label}}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>

                        <div class="actions">
                            <button mat-button type="button" 
                                    (click)="settingsForm.reset()">
                                Reset
                            </button>
                            <button mat-raised-button 
                                    color="primary" 
                                    type="submit" 
                                    [disabled]="!settingsForm.valid || settingsForm.pristine">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [`
        .settings-container {
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px 0;
        }

        .actions {
            margin-top: 16px;
            display: flex;
            justify-content: flex-end;
        }
    `]
})
export class SettingsComponent implements OnInit, OnDestroy {
    settingsForm: FormGroup;
    private destroy$ = new Subject<void>();
    
    readonly currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
    ];

    readonly themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System Default' }
    ];

    constructor(
        private fb: FormBuilder,
        private settingsService: SettingsService,
        private snackBar: MatSnackBar
    ) {
        this.settingsForm = this.fb.group({
            displayName: [''],
            currency: ['USD'],
            theme: ['system']
        });
    }

    ngOnInit(): void {
        // Subscribe to settings changes
        this.settingsService.settings$
            .pipe(takeUntil(this.destroy$))
            .subscribe(settings => {
                this.settingsForm.patchValue(settings, { emitEvent: false });
            });

        // Load current settings
        this.settingsService.loadSettings();

        // Subscribe to theme changes
        this.settingsForm.get('theme')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(theme => {
                this.applyTheme(theme);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.settingsForm.valid) {
            const settings: UserSettings = this.settingsForm.value;
            this.settingsService.updateSettings(settings)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    () => {
                        this.snackBar.open('Settings saved successfully', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    },
                    error => {
                        console.error('Error saving settings:', error);
                        this.snackBar.open('Error saving settings', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                );
        }
    }

    private applyTheme(theme: 'light' | 'dark' | 'system'): void {
        const body = document.body;
        body.classList.remove('light-theme', 'dark-theme');

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
        } else {
            body.classList.add(`${theme}-theme`);
        }
    }
}