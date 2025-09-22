import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailPreferences {
  _id?: string;
  userId?: string;
  transactionNotifications: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'never';
    minAmount: number;
    categories: string[];
  };
  budgetAlerts: {
    enabled: boolean;
    thresholds: {
      warning: number;
      critical: number;
      exceeded: boolean;
    };
  };
  reports: {
    weekly: {
      enabled: boolean;
      dayOfWeek: number;
      time: string;
    };
    monthly: {
      enabled: boolean;
      dayOfMonth: number;
      time: string;
    };
  };
  accountEmails: {
    welcome: boolean;
    security: boolean;
    passwordReset: boolean;
    emailVerification: boolean;
  };
  marketing: {
    newsletter: boolean;
    financialTips: boolean;
    productUpdates: boolean;
    personalizedInsights: boolean;
  };
  emailFormat: 'html' | 'text';
  timezone: string;
  deliveryStatus?: {
    lastEmailSent?: Date;
    failedDeliveries?: number;
    lastFailure?: Date;
    isBlacklisted?: boolean;
  };
}

export interface EmailStats {
  lastEmailSent: Date | null;
  failedDeliveries: number;
  lastFailure: Date | null;
  isBlacklisted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly apiUrl = `${environment.apiUrl}/email`;
  private preferencesSubject = new BehaviorSubject<EmailPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get user's email preferences
  getPreferences(): Observable<{ success: boolean; data: EmailPreferences }> {
    return this.http.get<{ success: boolean; data: EmailPreferences }>(`${this.apiUrl}/preferences`);
  }

  // Update user's email preferences
  updatePreferences(preferences: Partial<EmailPreferences>): Observable<{ success: boolean; message: string; data: EmailPreferences }> {
    return this.http.put<{ success: boolean; message: string; data: EmailPreferences }>(`${this.apiUrl}/preferences`, preferences);
  }

  // Load and cache preferences
  loadPreferences(): void {
    this.getPreferences().subscribe({
      next: (response) => {
        if (response.success) {
          this.preferencesSubject.next(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load email preferences:', error);
      }
    });
  }

  // Update cached preferences
  updateCachedPreferences(preferences: EmailPreferences): void {
    this.preferencesSubject.next(preferences);
  }

  // Get current cached preferences
  getCurrentPreferences(): EmailPreferences | null {
    return this.preferencesSubject.value;
  }

  // Send test email
  sendTestEmail(emailType: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/test`, { emailType });
  }

  // Get email delivery statistics
  getEmailStats(): Observable<{ success: boolean; data: EmailStats }> {
    return this.http.get<{ success: boolean; data: EmailStats }>(`${this.apiUrl}/stats`);
  }

  // Reset email blacklist status
  resetBlacklist(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/reset-blacklist`, {});
  }

  // Unsubscribe from all emails
  unsubscribeAll(token: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/unsubscribe`, { token });
  }

  // Unsubscribe from specific email type
  unsubscribeType(type: string, token: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/unsubscribe/${type}`, { token });
  }

  // Helper methods
  getFrequencyOptions() {
    return [
      { value: 'immediate', label: 'Immediately' },
      { value: 'daily', label: 'Daily digest' },
      { value: 'weekly', label: 'Weekly digest' },
      { value: 'never', label: 'Never' }
    ];
  }

  getDayOfWeekOptions() {
    return [
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' },
      { value: 7, label: 'Sunday' }
    ];
  }

  getTimeOptions() {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      const displayTime = hour === 0 ? '12:00 AM' : 
                         hour < 12 ? `${hour}:00 AM` : 
                         hour === 12 ? '12:00 PM' : 
                         `${hour - 12}:00 PM`;
      times.push({ value: timeString, label: displayTime });
    }
    return times;
  }

  getTimezoneOptions() {
    return [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' },
      { value: 'Europe/London', label: 'London' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Asia/Shanghai', label: 'Shanghai' }
    ];
  }

  getDefaultPreferences(): EmailPreferences {
    return {
      transactionNotifications: {
        enabled: true,
        frequency: 'immediate',
        minAmount: 0,
        categories: []
      },
      budgetAlerts: {
        enabled: true,
        thresholds: {
          warning: 75,
          critical: 90,
          exceeded: true
        }
      },
      reports: {
        weekly: {
          enabled: true,
          dayOfWeek: 1,
          time: '09:00'
        },
        monthly: {
          enabled: true,
          dayOfMonth: 1,
          time: '09:00'
        }
      },
      accountEmails: {
        welcome: true,
        security: true,
        passwordReset: true,
        emailVerification: true
      },
      marketing: {
        newsletter: true,
        financialTips: true,
        productUpdates: true,
        personalizedInsights: true
      },
      emailFormat: 'html',
      timezone: 'UTC'
    };
  }
}