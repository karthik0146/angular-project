import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsService, UserSettings } from '../../../core/services/settings.service';
import { EmailPreferencesComponent } from './email-preferences.component';
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
        MatSelectModule,
        MatTabsModule,
        MatIconModule,
        MatSnackBarModule,
        EmailPreferencesComponent
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
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
                // Apply theme immediately when form value changes
                this.settingsService.applyThemeManually(theme);
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
                .subscribe({
                    next: () => {
                        this.snackBar.open('Settings saved successfully', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                        // Mark form as pristine after successful save
                        this.settingsForm.markAsPristine();
                    },
                    error: (error) => {
                        console.error('Error saving settings:', error);
                        let errorMessage = 'Error saving settings';
                        if (error?.error?.error) {
                            errorMessage = error.error.error;
                        } else if (error?.error?.errors && error.error.errors.length > 0) {
                            errorMessage = error.error.errors[0].msg;
                        }
                        this.snackBar.open(errorMessage, 'Close', {
                            duration: 5000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                });
        }
    }
}