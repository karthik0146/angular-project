import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../interfaces/auth.interface';
import { environment } from '../../../environments/environment';
import { AuthConfigService } from './auth-config.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        private authConfig: AuthConfigService
    ) {
        this.loadUser();
    }

    initiateGoogleLogin(): void {
        window.location.href = this.authConfig.getGoogleLoginUrl();
    }

    handleGoogleCallback(token: string): void {
        
        this.http.post<AuthResponse>(`${this.apiUrl}/google`, { token })
            .pipe(
                tap(response => {
                    // Store token and user data first
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.userSubject.next(response.user);
                    
                    // Initialize settings service with the user data that already includes settings
                    if (response.user.settings) {
                        import('./settings.service').then(() => {
                        });
                    }
                    
                    this.router.navigate(['/dashboard']);
                })
            )
            .subscribe({
                error: (error) => {
                    console.error('Google login error details:', error);
                    console.error('Error status:', error.status);
                    console.error('Error message:', error.error);
                    this.router.navigate(['/auth/login']);
                }
            });
    }

    private loadUser(): void {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            const userData = JSON.parse(user);
            this.userSubject.next(userData);
            
            // Initialize settings when loading user from localStorage
            if (userData.settings) {
                import('./settings.service').then(module => {
                    // Settings service will auto-initialize
                });
            }
        }
    }

    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    register(credentials: RegisterCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`);
    }

    updateProfile(updates: Partial<User>): Observable<{ user: User }> {
        return this.http.put<{ user: User }>(`${this.apiUrl}/profile`, updates)
            .pipe(
                tap(response => {
                    const user = response.user;
                    this.userSubject.next(user);
                    localStorage.setItem('user', JSON.stringify(user));
                })
            );
    }

    updatePassword(currentPassword: string, newPassword: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/password`, { currentPassword, newPassword });
    }

    private handleAuthResponse(response: AuthResponse): void {
        const { token, user } = response;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        
        // Initialize settings service when user logs in
        if (user.settings) {
            // Import SettingsService and initialize settings
            import('./settings.service').then(module => {
                // The settings service constructor will automatically initialize with the user data
            });
        }
    }

    get isAuthenticated(): boolean {
        return !!this.userSubject.value;
    }

    get isAdmin(): boolean {
        return this.userSubject.value?.role === 'admin';
    }

    get currentUser(): User | null {
        return this.userSubject.value;
    }
}