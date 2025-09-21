import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./transactions/transactions.component').then(m => m.TransactionsComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent)
            },
            {
                path: 'reports',
                loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
            },
            {
                path: 'ai-insights',
                loadComponent: () => import('./ai-insights/ai-insights.component').then(m => m.AIInsightsComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
            }
        ]
    }
];