import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { ThemePalette } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { EmailService, EmailPreferences, EmailStats } from '../../../core/services/email.service';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-email-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatInputModule
  ],
  templateUrl: './email-preferences.component.html',
  styleUrls: ['./email-preferences.component.scss']
})
export class EmailPreferencesComponent implements OnInit, OnDestroy {
  preferencesForm!: FormGroup;
  loading = false;
  saving = false;
  testingEmail = '';
  emailStats: EmailStats | null = null;
  categories: any[] = [];
  
  frequencyOptions = this.emailService.getFrequencyOptions();
  dayOfWeekOptions = this.emailService.getDayOfWeekOptions();
  timeOptions = this.emailService.getTimeOptions();
  timezoneOptions = this.emailService.getTimezoneOptions();
  
  testEmailTypes = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'weekly-report', label: 'Weekly Report' },
    { value: 'monthly-report', label: 'Monthly Report' },
    { value: 'personalized-tips', label: 'Personalized Tips' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPreferences();
    this.loadCategories();
    this.loadEmailStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const defaultPreferences = this.emailService.getDefaultPreferences();
    
    this.preferencesForm = this.fb.group({
      // Transaction notifications
      transactionNotifications: this.fb.group({
        enabled: [defaultPreferences.transactionNotifications.enabled],
        frequency: [defaultPreferences.transactionNotifications.frequency],
        minAmount: [defaultPreferences.transactionNotifications.minAmount],
        categories: [defaultPreferences.transactionNotifications.categories]
      }),
      
      // Budget alerts
      budgetAlerts: this.fb.group({
        enabled: [defaultPreferences.budgetAlerts.enabled],
        thresholds: this.fb.group({
          warning: [defaultPreferences.budgetAlerts.thresholds.warning],
          critical: [defaultPreferences.budgetAlerts.thresholds.critical],
          exceeded: [defaultPreferences.budgetAlerts.thresholds.exceeded]
        })
      }),
      
      // Reports
      reports: this.fb.group({
        weekly: this.fb.group({
          enabled: [defaultPreferences.reports.weekly.enabled],
          dayOfWeek: [defaultPreferences.reports.weekly.dayOfWeek],
          time: [defaultPreferences.reports.weekly.time]
        }),
        monthly: this.fb.group({
          enabled: [defaultPreferences.reports.monthly.enabled],
          dayOfMonth: [defaultPreferences.reports.monthly.dayOfMonth],
          time: [defaultPreferences.reports.monthly.time]
        })
      }),
      
      // Account emails
      accountEmails: this.fb.group({
        welcome: [defaultPreferences.accountEmails.welcome],
        security: [defaultPreferences.accountEmails.security],
        passwordReset: [defaultPreferences.accountEmails.passwordReset],
        emailVerification: [defaultPreferences.accountEmails.emailVerification]
      }),
      
      // Marketing
      marketing: this.fb.group({
        newsletter: [defaultPreferences.marketing.newsletter],
        financialTips: [defaultPreferences.marketing.financialTips],
        productUpdates: [defaultPreferences.marketing.productUpdates],
        personalizedInsights: [defaultPreferences.marketing.personalizedInsights]
      }),
      
      // General settings
      emailFormat: [defaultPreferences.emailFormat],
      timezone: [defaultPreferences.timezone]
    });
  }

  private loadPreferences(): void {
    this.loading = true;
    this.emailService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.preferencesForm.patchValue(response.data);
            this.emailService.updateCachedPreferences(response.data);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load preferences:', error);
          this.snackBar.open('Failed to load email preferences', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  private loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Failed to load categories:', error);
        }
      });
  }

  private loadEmailStats(): void {
    this.emailService.getEmailStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.emailStats = response.data;
          }
        },
        error: (error) => {
          console.error('Failed to load email stats:', error);
        }
      });
  }

  onSave(): void {
    if (this.preferencesForm.valid) {
      this.saving = true;
      const preferences = this.preferencesForm.value;
      
      this.emailService.updatePreferences(preferences)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.emailService.updateCachedPreferences(response.data);
              this.snackBar.open('Email preferences saved successfully', 'Close', { duration: 3000 });
            }
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to save preferences:', error);
            this.snackBar.open('Failed to save email preferences', 'Close', { duration: 3000 });
            this.saving = false;
          }
        });
    }
  }

  onTestEmail(emailType: string): void {
    this.testingEmail = emailType;
    
    this.emailService.sendTestEmail(emailType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(`Test ${emailType} email sent successfully`, 'Close', { duration: 3000 });
          }
          this.testingEmail = '';
        },
        error: (error) => {
          console.error('Failed to send test email:', error);
          this.snackBar.open('Failed to send test email', 'Close', { duration: 3000 });
          this.testingEmail = '';
        }
      });
  }

  onResetBlacklist(): void {
    this.emailService.resetBlacklist()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Email blacklist status reset', 'Close', { duration: 3000 });
            this.loadEmailStats(); // Reload stats
          }
        },
        error: (error) => {
          console.error('Failed to reset blacklist:', error);
          this.snackBar.open('Failed to reset blacklist status', 'Close', { duration: 3000 });
        }
      });
  }

  // Helper methods
  formatLastEmailDate(date: Date | null): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  getThresholdColor(value: number): ThemePalette {
    if (value >= 90) return 'warn';
    if (value >= 75) return 'accent';
    return 'primary';
  }

  getDayOfMonthOptions(): number[] {
    return Array.from({ length: 28 }, (_, i) => i + 1);
  }
}