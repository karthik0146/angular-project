import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService, TransactionStats } from '../../../core/services/transaction.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    template: `
        <div class="overview-container">
            <div class="summary-cards">
                <mat-card class="summary-card income">
                    <mat-card-content>
                        <div class="card-content">
                            <div class="icon-container">
                                <mat-icon>arrow_upward</mat-icon>
                            </div>
                            <div class="info">
                                <h3>Income</h3>
                                <p class="amount">₹{{ stats?.summary?.income?.toLocaleString() || '0' }}</p>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="summary-card expense">
                    <mat-card-content>
                        <div class="card-content">
                            <div class="icon-container">
                                <mat-icon>arrow_downward</mat-icon>
                            </div>
                            <div class="info">
                                <h3>Expense</h3>
                                <p class="amount">₹{{ stats?.summary?.expense?.toLocaleString() || '0' }}</p>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="summary-card balance">
                    <mat-card-content>
                        <div class="card-content">
                            <div class="icon-container">
                                <mat-icon>account_balance_wallet</mat-icon>
                            </div>
                            <div class="info">
                                <h3>Balance</h3>
                                <p class="amount" [class.negative]="(stats?.summary?.balance || 0) < 0">
                                    ₹{{ stats?.summary?.balance?.toLocaleString() || '0' }}
                                </p>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <div class="charts-container">
                <mat-card class="chart-card">
                    <mat-card-header>
                        <mat-card-title>Expense by Category</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <canvas #expenseChart></canvas>
                    </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                    <mat-card-header>
                        <mat-card-title>Income by Category</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <canvas #incomeChart></canvas>
                    </mat-card-content>
                </mat-card>
            </div>
        </div>
    `,
    styles: [`
        .overview-container {
            padding: 20px;
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .summary-card {
            .card-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .icon-container {
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;

                mat-icon {
                    font-size: 24px;
                    width: 24px;
                    height: 24px;
                }
            }

            .info {
                h3 {
                    margin: 0;
                    font-size: 1rem;
                    color: rgba(0, 0, 0, 0.7);
                }

                .amount {
                    margin: 4px 0 0;
                    font-size: 1.5rem;
                    font-weight: 500;
                }
            }

            &.income {
                .icon-container {
                    background-color: rgba(76, 175, 80, 0.1);
                    color: #4caf50;
                }
            }

            &.expense {
                .icon-container {
                    background-color: rgba(244, 67, 54, 0.1);
                    color: #f44336;
                }
            }

            &.balance {
                .icon-container {
                    background-color: rgba(33, 150, 243, 0.1);
                    color: #2196f3;
                }

                .amount.negative {
                    color: #f44336;
                }
            }
        }

        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .chart-card {
            mat-card-content {
                padding: 16px;
                height: 300px;
            }
        }
    `]
})
export class OverviewComponent implements OnInit, AfterViewInit {
    @ViewChild('expenseChart') expenseChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('incomeChart') incomeChartRef!: ElementRef<HTMLCanvasElement>;
    
    stats?: TransactionStats;
    private expenseChart?: Chart;
    private incomeChart?: Chart;

    constructor(private transactionService: TransactionService) {}

    ngAfterViewInit(): void {
        // Initialize empty charts
        this.initCharts();
    }

    private initCharts(): void {
        // Initialize expense chart
        this.expenseChart = new Chart(this.expenseChartRef.nativeElement, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: []
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

        // Initialize income chart
        this.incomeChart = new Chart(this.incomeChartRef.nativeElement, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: []
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    ngOnInit(): void {
        this.loadStats();
    }

    private loadStats(): void {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

        this.transactionService.getStats(startDate, endDate).subscribe(stats => {
            this.stats = stats;
            this.updateChartData();
        });
    }

    private updateChartData(): void {
        if (!this.stats || !this.expenseChart || !this.incomeChart) return;

        // Process expense data
        const expenseData = this.stats.categoryBreakdown
            .filter(item => item.type === 'expense')
            .map(item => ({
                label: item.category.name,
                value: item.total,
                color: item.category.color
            }));

        this.expenseChart.data = {
            labels: expenseData.map(d => d.label),
            datasets: [{
                data: expenseData.map(d => d.value),
                backgroundColor: expenseData.map(d => d.color)
            }]
        };
        this.expenseChart.update();

        // Process income data
        const incomeData = this.stats.categoryBreakdown
            .filter(item => item.type === 'income')
            .map(item => ({
                label: item.category.name,
                value: item.total,
                color: item.category.color
            }));

        this.incomeChart.data = {
            labels: incomeData.map(d => d.label),
            datasets: [{
                data: incomeData.map(d => d.value),
                backgroundColor: incomeData.map(d => d.color)
            }]
        };
        this.incomeChart.update();
    }
}