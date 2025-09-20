import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserSettings {
    displayName: string;
    currency: string;
    theme: 'light' | 'dark' | 'system';
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private settingsSubject = new BehaviorSubject<UserSettings>({
        displayName: '',
        currency: 'USD',
        theme: 'system'
    });

    settings$ = this.settingsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.initializeSettings();
    }
    
    private initializeSettings(): void {
        // Check if user has settings in localStorage first
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            if (userData.settings) {
                const settings = {
                    displayName: userData.settings.displayName || userData.name || '',
                    currency: userData.settings.currency || 'USD',
                    theme: userData.settings.theme || 'system'
                };
                this.settingsSubject.next(settings);
                // Apply theme immediately
                this.applyTheme(settings.theme);
                return;
            }
        }
        
        // Otherwise load from server
        this.loadSettings();
    }

    loadSettings(): void {
        console.log('Loading settings from server...');
        this.http.get<UserSettings>(`${this.apiUrl}/settings`)
            .subscribe({
                next: (settings) => {
                    console.log('Settings loaded:', settings);
                    this.settingsSubject.next(settings);
                    // Apply theme when settings are loaded
                    this.applyTheme(settings.theme);
                },
                error: (error) => {
                    console.error('Error loading settings:', error);
                    // Set default settings if loading fails
                    const defaultSettings = {
                        displayName: '',
                        currency: 'USD',
                        theme: 'system' as const
                    };
                    this.settingsSubject.next(defaultSettings);
                    this.applyTheme(defaultSettings.theme);
                }
            });
    }

    updateSettings(settings: UserSettings): Observable<UserSettings> {
        console.log('Updating settings:', settings);
        return this.http.put<UserSettings>(`${this.apiUrl}/settings`, settings)
            .pipe(
                tap(updatedSettings => {
                    console.log('Settings updated successfully:', updatedSettings);
                    this.settingsSubject.next(updatedSettings);
                    // Apply theme immediately when settings are updated
                    this.applyTheme(updatedSettings.theme);
                    // Also update localStorage if user data exists
                    const user = localStorage.getItem('user');
                    if (user) {
                        const userData = JSON.parse(user);
                        userData.settings = updatedSettings;
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                })
            );
    }

    getCurrentSettings(): UserSettings {
        return this.settingsSubject.value;
    }

    // Apply theme globally
    private applyTheme(theme: 'light' | 'dark' | 'system'): void {
        console.log('Applying theme:', theme);
        const body = document.body;
        body.classList.remove('light-theme', 'dark-theme');

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const appliedTheme = prefersDark ? 'dark-theme' : 'light-theme';
            body.classList.add(appliedTheme);
            console.log('Applied system theme:', appliedTheme);
        } else {
            const appliedTheme = `${theme}-theme`;
            body.classList.add(appliedTheme);
            console.log('Applied theme:', appliedTheme);
        }
        
        // Store the applied theme for persistence
        localStorage.setItem('applied-theme', theme);
    }

    // Method to manually apply theme (can be called from components)
    applyThemeManually(theme: 'light' | 'dark' | 'system'): void {
        this.applyTheme(theme);
    }

    // Force reload settings from server
    refreshSettings(): void {
        this.loadSettings();
    }
}