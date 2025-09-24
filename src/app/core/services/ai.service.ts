import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AIInsight {
    type: 'spending_pattern' | 'budget_recommendation' | 'category_suggestion' | 'anomaly_detection';
    title: string;
    description: string;
    confidence: number;
    actionable?: boolean;
    action?: string;
}

export interface TransactionCategorization {
    suggestedCategory: string;
    confidence: number;
    reasoning: string;
}

export interface SpendingAnalysis {
    monthlyTrend: 'increasing' | 'decreasing' | 'stable';
    topCategories: Array<{ category: string; percentage: number }>;
    insights: AIInsight[];
    recommendations: string[];
}

export interface BudgetPrediction {
    nextMonthPrediction: number;
    categoryBreakdown: Array<{ category: string; predicted: number; actual?: number; percentage?: number }>;
    confidence: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
}

@Injectable({
    providedIn: 'root'
})
export class AIService {
    private apiUrl = `${environment.apiUrl}/ai`;
    private insightsSubject = new BehaviorSubject<AIInsight[]>([]);
    public insights$ = this.insightsSubject.asObservable();

    constructor(private http: HttpClient) {}

    /**
     * Analyze transaction description and suggest category using AI
     */
    categorizeTransaction(description: string, amount: number, merchantInfo?: string): Observable<TransactionCategorization> {
        return this.http.post<TransactionCategorization>(`${this.apiUrl}/categorize`, {
            description,
            amount,
            merchantInfo
        });
    }

    /**
     * Get AI-powered spending analysis and insights
     */
    analyzeSpendingPatterns(period: 'month' | 'quarter' | 'year' = 'month'): Observable<SpendingAnalysis> {
        return this.http.post<SpendingAnalysis>(`${this.apiUrl}/analyze-spending`, {
            period
        });
    }

    /**
     * Get budget predictions based on historical data
     */
    predictBudget(targetMonth?: string): Observable<BudgetPrediction> {
        return this.http.post<BudgetPrediction>(`${this.apiUrl}/predict-budget`, {
            targetMonth
        });
    }

    /**
     * Detect spending anomalies using AI
     */
    detectAnomalies(): Observable<AIInsight[]> {
        return this.http.post<AIInsight[]>(`${this.apiUrl}/detect-anomalies`, {});
    }

    /**
     * Get personalized financial recommendations
     */
    getRecommendations(): Observable<AIInsight[]> {
        return this.http.post<AIInsight[]>(`${this.apiUrl}/recommendations`, {});
    }

    /**
     * OCR for receipt processing
     */
    processReceipt(imageFile: File): Observable<{
        merchantName: string;
        totalAmount: number;
        date: string;
        items: Array<{ name: string; price: number; category?: string }>;
        suggestedCategory: string;
    }> {
        const formData = new FormData();
        formData.append('receipt', imageFile);
        
        return this.http.post<any>(`${this.apiUrl}/process-receipt`, formData);
    }

    /**
     * Get AI-powered financial health score
     */
    calculateFinancialHealthScore(): Observable<{
        score: number; // 0-100
        factors: Array<{ name: string; impact: 'positive' | 'negative' | 'neutral'; description: string }>;
        improvements: string[];
    }> {
        return this.http.post<any>(`${this.apiUrl}/health-score`, {});
    }

    /**
     * Chat with AI assistant for financial advice
     */
    chatWithAssistant(message: string, context?: any): Observable<{
        response: string;
        suggestions?: string[];
        needsMoreInfo?: boolean;
    }> {
        return this.http.post<any>(`${this.apiUrl}/chat`, {
            message,
            context
        });
    }

    /**
     * Update insights cache
     */
    updateInsights(insights: AIInsight[]): void {
        this.insightsSubject.next(insights);
    }

    /**
     * Get current insights
     */
    getCurrentInsights(): AIInsight[] {
        return this.insightsSubject.value;
    }
}