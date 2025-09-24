import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule
    ],
    template: `
        <mat-sidenav-container class="sidenav-container">
            <mat-sidenav #sidenav mode="side" opened class="sidenav">
                <div class="logo">
                    <h1>EXTrace</h1>
                </div>
                <mat-nav-list>
                    <a mat-list-item routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                        <mat-icon matListItemIcon>dashboard</mat-icon>
                        <span matListItemTitle>Overview</span>
                    </a>
                    <a mat-list-item routerLink="/dashboard/transactions" routerLinkActive="active">
                        <mat-icon matListItemIcon>receipt</mat-icon>
                        <span matListItemTitle>Transactions</span>
                    </a>
                    <a mat-list-item routerLink="/dashboard/categories" routerLinkActive="active">
                        <mat-icon matListItemIcon>category</mat-icon>
                        <span matListItemTitle>Categories</span>
                    </a>
                    <a mat-list-item routerLink="/dashboard/reports" routerLinkActive="active">
                        <mat-icon matListItemIcon>bar_chart</mat-icon>
                        <span matListItemTitle>Reports</span>
                    </a>
                    <a mat-list-item routerLink="/dashboard/ai-insights" routerLinkActive="active">
                        <mat-icon matListItemIcon>psychology</mat-icon>
                        <span matListItemTitle>AI Insights</span>
                    </a>
                    <a mat-list-item routerLink="/dashboard/settings" routerLinkActive="active">
                        <mat-icon matListItemIcon>settings</mat-icon>
                        <span matListItemTitle>Settings</span>
                    </a>
                </mat-nav-list>
            </mat-sidenav>

            <mat-sidenav-content>
                <mat-toolbar color="primary">
                    <button mat-icon-button (click)="sidenav.toggle()">
                        <mat-icon>menu</mat-icon>
                    </button>
                    <span class="spacer"></span>
                    <button mat-button [matMenuTriggerFor]="userMenu">
                        <mat-icon>account_circle</mat-icon>
                        {{ userName }}
                    </button>
                    <mat-menu #userMenu="matMenu">
                        <button mat-menu-item routerLink="/dashboard/settings">
                            <mat-icon>person</mat-icon>
                            <span>Profile</span>
                        </button>
                        <button mat-menu-item (click)="logout()">
                            <mat-icon>exit_to_app</mat-icon>
                            <span>Logout</span>
                        </button>
                    </mat-menu>
                </mat-toolbar>

                <div class="content">
                    <router-outlet></router-outlet>
                </div>
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    styles: [`
        .sidenav-container {
            height: 100vh;
        }

        .sidenav {
            width: 250px;
            background-color: #f5f5f5;
        }

        .logo {
            padding: 16px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }

        .logo h1 {
            margin: 0;
            font-size: 24px;
            color: #1976d2;
        }

        .content {
            padding: 20px;
        }

        .spacer {
            flex: 1 1 auto;
        }

        .mat-toolbar {
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .active {
            background-color: rgba(25, 118, 210, 0.1);
            color: #1976d2;
        }
    `]
})
export class DashboardComponent {
    constructor(private authService: AuthService) {}

    get userName(): string {
        return this.authService.currentUser?.name || 'User';
    }

    logout(): void {
        this.authService.logout();
    }
}