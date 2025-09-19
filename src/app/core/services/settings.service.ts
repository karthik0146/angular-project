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
    private apiUrl = `${environment.apiUrl}/settings`;
    private settingsSubject = new BehaviorSubject<UserSettings>({
        displayName: '',
        currency: 'USD',
        theme: 'system'
    });

    settings$ = this.settingsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadSettings();
    }

    loadSettings(): void {
        this.http.get<UserSettings>(`${this.apiUrl}/user`)
            .subscribe(
                settings => this.settingsSubject.next(settings),
                error => console.error('Error loading settings:', error)
            );
    }

    updateSettings(settings: UserSettings): Observable<UserSettings> {
        return this.http.put<UserSettings>(`${this.apiUrl}/user`, settings)
            .pipe(
                tap(updatedSettings => this.settingsSubject.next(updatedSettings))
            );
    }

    getCurrentSettings(): UserSettings {
        return this.settingsSubject.value;
    }
}