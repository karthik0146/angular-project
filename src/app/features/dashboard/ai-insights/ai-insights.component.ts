import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
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
        MatTooltipModule,
        FormsModule
    ],
    templateUrl: './ai-insights.component.html',
    styleUrls: ['./ai-insights.component.scss']
})
export class AIInsightsComponent implements OnInit, AfterViewChecked {
    @ViewChild('chatMessagesContainer') private chatContainer!: ElementRef;
    @ViewChild('messageInput') private messageInput!: ElementRef;
    
    loading = false;
    insights: AIInsight[] = [];
    spendingAnalysis?: SpendingAnalysis;
    budgetPrediction?: BudgetPrediction;
    financialHealthScore?: any;
    chatMessages: Array<{text: string, isUser: boolean}> = [];
    currentMessage = '';
    isTyping = false;
    showInputHint = false;
    private shouldScrollToBottom = false;
    
    welcomeSuggestions = [
        'How can I save more money?',
        'Analyze my spending patterns',
        'What are my biggest expenses?',
        'Give me budgeting tips'
    ];

    constructor(
        private aiService: AIService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loadAIData();
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    async loadAIData(): Promise<void> {
        this.loading = true;        
        try {
            // Reset insights
            this.insights = [];
            
            // Load spending analysis with fallback
            this.aiService.analyzeSpendingPatterns('month').subscribe({
                next: (analysis) => {
                    this.spendingAnalysis = analysis;
                    this.insights = [...this.insights, ...analysis.insights];
                },
                error: (error) => {
                    console.error('❌ Error loading spending analysis:', error);
                    // Fallback spending analysis
                    this.spendingAnalysis = {
                        monthlyTrend: 'stable',
                        topCategories: [],
                        insights: [],
                        recommendations: ['Add transactions to get insights', 'Set up expense categories']
                    };
                }
            });

            // Load budget prediction with fallback
            this.aiService.predictBudget().subscribe({
                next: (prediction) => {
                    this.budgetPrediction = prediction;
                },
                error: (error) => {
                    console.error('❌ Error loading budget prediction:', error);
                    // Fallback budget prediction
                    this.budgetPrediction = {
                        nextMonthPrediction: 0,
                        categoryBreakdown: [],
                        confidence: 0,
                        trend: 'stable'
                    };
                }
            });

            // Load financial health score with fallback
            this.aiService.calculateFinancialHealthScore().subscribe({
                next: (healthScore) => {
                    this.financialHealthScore = healthScore;
                },
                error: (error) => {
                    console.error('❌ Error loading health score:', error);
                    // Fallback health score
                    this.financialHealthScore = {
                        score: 50,
                        factors: [
                            { name: 'Data Availability', impact: 'neutral', description: 'Add more transactions for accurate scoring' }
                        ],
                        improvements: ['Start tracking income and expenses', 'Set financial goals']
                    };
                }
            });

            // Load recommendations with fallback
            this.aiService.getRecommendations().subscribe({
                next: (recommendations) => {
                    this.insights = [...this.insights, ...recommendations];
                },
                error: (error) => {
                    console.error('❌ Error loading recommendations:', error);
                    // Add fallback insights
                    const fallbackInsights = [
                        {
                            type: 'spending_pattern' as const,
                            title: 'Getting Started',
                            description: 'Add some transactions to get personalized AI insights and recommendations.',
                            confidence: 100,
                            actionable: true,
                            action: 'Add your first transaction'
                        },
                        {
                            type: 'budget_recommendation' as const,
                            title: 'Set Up Categories',
                            description: 'Create expense categories to better organize your spending.',
                            confidence: 100,
                            actionable: true,
                            action: 'Create categories'
                        }
                    ];
                    this.insights = [...this.insights, ...fallbackInsights];
                }
            });

        } catch (error) {
            console.error('❌ Error loading AI data:', error);
        } finally {
            // Delay to show loading animation
            setTimeout(() => {
                this.loading = false;
            }, 1000);
        }
    }

    sendMessage(): void {
        if (!this.currentMessage.trim() || this.isTyping) return;

        const userMessage = this.currentMessage;
        this.chatMessages.push({ text: userMessage, isUser: true });
        this.currentMessage = '';
        this.isTyping = true;
        this.shouldScrollToBottom = true;

        // Focus back to input
        setTimeout(() => {
            if (this.messageInput) {
                this.messageInput.nativeElement.focus();
            }
        }, 100);

        this.aiService.chatWithAssistant(userMessage).subscribe({
            next: (response) => {
                setTimeout(() => {
                    this.isTyping = false;
                    this.chatMessages.push({ text: response.response, isUser: false });
                    if (response.suggestions) {
                        response.suggestions.forEach(suggestion => {
                            this.chatMessages.push({ text: `💡 ${suggestion}`, isUser: false });
                        });
                    }
                    this.shouldScrollToBottom = true;
                }, 1000); // Simulate typing delay
            },
            error: (error) => {
                console.error('❌ Error in AI chat:', error);
                
                setTimeout(() => {
                    this.isTyping = false;
                    
                    // Provide helpful fallback responses based on message content
                    let fallbackResponse = "I'm having trouble connecting to the AI service right now.";
                    
                    const lowerMessage = userMessage.toLowerCase();
                    if (lowerMessage.includes('budget') || lowerMessage.includes('money')) {
                        fallbackResponse = "For budget advice, I recommend tracking your expenses regularly and setting spending limits for each category. You can view your spending patterns in the dashboard.";
                    } else if (lowerMessage.includes('save') || lowerMessage.includes('savings')) {
                        fallbackResponse = "Great question about savings! Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Start by tracking where your money goes each month.";
                    } else if (lowerMessage.includes('expense') || lowerMessage.includes('spending')) {
                        fallbackResponse = "To better manage expenses, categorize your spending and review your largest expense categories. The reports section can help you identify patterns.";
                    } else if (lowerMessage.includes('income')) {
                        fallbackResponse = "Track all your income sources in the app. This helps you understand your cash flow and plan your budget more effectively.";
                    } else {
                        fallbackResponse = "I'm currently offline, but here are some quick tips: 1) Track all transactions, 2) Set monthly budgets, 3) Review your spending weekly. Try the dashboard for detailed insights!";
                    }
                    
                    this.chatMessages.push({ text: fallbackResponse, isUser: false });
                    this.shouldScrollToBottom = true;
                }, 1000);
            }
        });
    }

    sendSuggestion(suggestion: string): void {
        this.currentMessage = suggestion;
        this.sendMessage();
    }

    clearChat(): void {
        this.chatMessages = [];
        this.currentMessage = '';
        this.isTyping = false;
    }

    getCurrentTime(): string {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    private scrollToBottom(): void {
        try {
            if (this.chatContainer) {
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
            }
        } catch (err) {
            // Silently handle scroll errors
        }
    }

    // Health Score Methods
    getHealthScoreClass(score: number): string {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    getHealthScoreLabel(score: number): string {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Work';
    }

    getFactorIcon(impact: string): string {
        switch (impact) {
            case 'positive': return 'trending_up';
            case 'negative': return 'trending_down';
            default: return 'remove';
        }
    }

    // Budget Prediction Methods
    getTrendIcon(trend: string): string {
        if (trend === 'increasing') return 'trending_up';
        if (trend === 'decreasing') return 'trending_down';
        return 'trending_flat';
    }

    getTrendText(trend: string): string {
        if (trend === 'increasing') return 'Spending trending up';
        if (trend === 'decreasing') return 'Spending trending down';
        return 'Stable spending pattern';
    }

    // Recommendation Methods
    getRecommendationIcon(index: number): string {
        const icons = ['savings', 'account_balance', 'trending_down', 'lightbulb', 'star'];
        return icons[index % icons.length];
    }

    // Insight Methods
    getActionIcon(action?: string): string {
        if (!action) return 'lightbulb';
        if (action.toLowerCase().includes('save')) return 'savings';
        if (action.toLowerCase().includes('budget')) return 'account_balance';
        if (action.toLowerCase().includes('reduce')) return 'trending_down';
        return 'play_arrow';
    }

    // Utility Methods
    getPercentage(amount: number, total: number): number {
        return total > 0 ? Math.round((amount / total) * 100) : 0;
    }

    getHealthScoreColor(score: number): string {
        if (score >= 80) return 'primary';
        if (score >= 60) return 'accent';
        return 'warn';
    }

    getHealthScoreIcon(score: number): string {
        if (score >= 80) return 'verified';
        if (score >= 60) return 'check_circle';
        if (score >= 40) return 'warning';
        return 'error';
    }

    getFactorProgress(factor: any): number {
        // Calculate progress based on factor impact
        switch (factor.impact) {
            case 'positive': return 85;
            case 'negative': return 35;
            default: return 60;
        }
    }

    getImprovementIcon(improvement: string | number): string {
        const icons = ['trending_up', 'savings', 'account_balance', 'star', 'lightbulb', 'speed'];
        if (typeof improvement === 'number') {
            return icons[improvement % icons.length];
        }
        // If it's a string, pick icon based on content
        const improvementStr = improvement.toString().toLowerCase();
        if (improvementStr.includes('save')) return 'savings';
        if (improvementStr.includes('budget')) return 'account_balance';
        if (improvementStr.includes('income')) return 'trending_up';
        return 'lightbulb';
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
        }
    }

    onInputFocus(): void {
        this.showInputHint = true;
    }

    onInputBlur(): void {
        // Delay hiding the hint to allow for clicking suggestions
        setTimeout(() => {
            this.showInputHint = false;
        }, 200);
    }
}