import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AIService, AIInsight, SpendingAnalysis, BudgetPrediction } from '../../../core/services/ai.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-ai-insights',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
    templateUrl: './ai-insights.component.html',
    styleUrls: ['./ai-insights.component.scss']
})
export class AIInsightsComponent implements OnInit {
    loading = false;
    insights: AIInsight[] = [];
    spendingAnalysis?: SpendingAnalysis;
    budgetPrediction?: BudgetPrediction;
    financialHealthScore?: any;
    chatMessages: Array<{text: string, isUser: boolean}> = [];
    currentMessage = '';

    constructor(
        private aiService: AIService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loadAIData();
    }

    async loadAIData(): Promise<void> {
        this.loading = true;
        
        try {
            // Load spending analysis
            this.aiService.analyzeSpendingPatterns('month').subscribe({
                next: (analysis) => {
                    this.spendingAnalysis = analysis;
                    this.insights = [...this.insights, ...analysis.insights];
                },
                error: (error) => console.error('Error loading spending analysis:', error)
            });

            // Load budget prediction
            this.aiService.predictBudget().subscribe({
                next: (prediction) => {
                    this.budgetPrediction = prediction;
                },
                error: (error) => console.error('Error loading budget prediction:', error)
            });

            // Load financial health score
            this.aiService.calculateFinancialHealthScore().subscribe({
                next: (healthScore) => {
                    this.financialHealthScore = healthScore;
                },
                error: (error) => console.error('Error loading health score:', error)
            });

            // Load recommendations
            this.aiService.getRecommendations().subscribe({
                next: (recommendations) => {
                    this.insights = [...this.insights, ...recommendations];
                },
                error: (error) => console.error('Error loading recommendations:', error)
            });

        } catch (error) {
            console.error('Error loading AI data:', error);
        } finally {
            this.loading = false;
        }
    }

    sendMessage(): void {
        if (!this.currentMessage.trim()) return;

        const userMessage = this.currentMessage;
        this.chatMessages.push({ text: userMessage, isUser: true });
        this.currentMessage = '';

        this.aiService.chatWithAssistant(userMessage).subscribe({
            next: (response) => {
                this.chatMessages.push({ text: response.response, isUser: false });
                if (response.suggestions) {
                    response.suggestions.forEach(suggestion => {
                        this.chatMessages.push({ text: `💡 ${suggestion}`, isUser: false });
                    });
                }
            },
            error: (error) => {
                this.chatMessages.push({ text: 'Sorry, I encountered an error. Please try again.', isUser: false });
                console.error('Chat error:', error);
            }
        });
    }

    getHealthScoreColor(score: number): string {
        if (score >= 80) return 'primary';
        if (score >= 60) return 'accent';
        return 'warn';
    }

    getInsightIcon(type: string): string {
        switch (type) {
            case 'spending_pattern': return 'trending_up';
            case 'budget_recommendation': return 'account_balance';
            case 'category_suggestion': return 'category';
            case 'anomaly_detection': return 'warning';
            default: return 'lightbulb';
        }
    }

    onInsightAction(insight: AIInsight): void {
        if (insight.actionable && insight.action) {
            // You can implement specific actions here
            console.log('Executing action:', insight.action);
        }
    }
}