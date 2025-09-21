import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthConfigService {
    private readonly googleConfig = {
        client_id: environment.googleClientId,
        redirect_uri: environment.redirectUri,
        scope: 'openid email profile',
        response_type: 'id_token token',
        prompt: 'consent'
    };

    getGoogleLoginUrl(): string {
        const params = new URLSearchParams({
            client_id: this.googleConfig.client_id,
            redirect_uri: this.googleConfig.redirect_uri,
            scope: this.googleConfig.scope,
            response_type: this.googleConfig.response_type,
            prompt: this.googleConfig.prompt,
            state: this.generateState(),
            nonce: this.generateNonce()
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    private generateNonce(): string {
        const timestamp = new Date().getTime();
        const randomStr = Math.random().toString(36).substring(2, 15);
        return `${timestamp}.${randomStr}`;
    }

    private generateState(): string {
        const timestamp = new Date().getTime();
        const randomStr = Math.random().toString(36).substring(2, 15);
        return `${timestamp}.${randomStr}`;
    }
}