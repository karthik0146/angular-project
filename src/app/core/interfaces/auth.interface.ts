export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    settings: UserSettings;
}

export interface UserSettings {
    displayName: string;
    theme: 'light' | 'dark' | 'system';
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CNY';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
}