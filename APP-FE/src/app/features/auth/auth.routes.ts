import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthCallbackComponent } from './callback/auth-callback.component';

export const AUTH_ROUTES: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login - Expense Tracker'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register - Expense Tracker'
    },
    {
        path: 'google/callback',
        component: AuthCallbackComponent
    }
];