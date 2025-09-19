export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    settings: UserSettings;
}

export interface UserSettings {
    theme: 'light' | 'dark';
    currency: 'INR' | 'USD' | 'EUR';
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