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
        // Handle the auth callback
        if (window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const idToken = params.get('id_token');
            const error = params.get('error');
                        
            if (error) {
                console.error('Google OAuth error:', error);
                console.error('Error description:', params.get('error_description'));
                this.router.navigate(['/auth/login']);
                return;
            }
            
            if (idToken) {
                this.authService.handleGoogleCallback(idToken);
            } else {
                this.router.navigate(['/auth/login']);
            }
        } else {
            console.error('No hash in URL');
            this.router.navigate(['/auth/login']);
        }
    }
}