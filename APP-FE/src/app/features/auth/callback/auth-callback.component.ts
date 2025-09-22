import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    templateUrl: './auth-callback.component.html',
    styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit() {
        console.log('Auth callback component initialized');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Handle the auth callback
        if (window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const idToken = params.get('id_token');
            const error = params.get('error');
            
            console.log('URL parameters found');
            
            if (error) {
                console.error('Google OAuth error:', error);
                console.error('Error description:', params.get('error_description'));
                this.router.navigate(['/auth/login']);
                return;
            }
            
            if (idToken) {
                console.log('ID token found, processing...');
                this.authService.handleGoogleCallback(idToken);
            } else {
                console.error('No ID token received from Google');
                this.router.navigate(['/auth/login']);
            }
        } else {
            console.error('No hash in URL');
            this.router.navigate(['/auth/login']);
        }
    }
}