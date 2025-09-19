import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    template: '<div>Processing login...</div>'
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
            if (idToken) {
                this.authService.handleGoogleCallback(idToken);
            } else {
                console.error('No ID token received from Google');
                this.router.navigate(['/auth/login']);
            }
        } else {
            this.router.navigate(['/auth/login']);
        }
    }
}