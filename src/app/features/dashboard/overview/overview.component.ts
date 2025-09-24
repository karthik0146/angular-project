import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TransactionService, TransactionStats } from '../../../core/services/transaction.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatButtonModule
    ],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, AfterViewInit {
    @ViewChild('expenseChart') expenseChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('incomeChart') incomeChartRef!: ElementRef<HTMLCanvasElement>;
    
    stats?: TransactionStats;
    loading = false;
    error: string | null = null;
    private expenseChart?: Chart;
    private incomeChart?: Chart;

    constructor(private transactionService: TransactionService) {}

    ngAfterViewInit(): void {
        // Initialize empty charts
        this.initCharts();
    }

    private initCharts(): void {
        // Check if canvas elements exist before initializing
        if (!this.expenseChartRef?.nativeElement || !this.incomeChartRef?.nativeElement) {
            console.warn('Chart canvas elements not found - will retry after data loads');
            return;
        }

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

    loadStats(): void {
        this.loading = true;
        this.error = null;
        
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

        this.transactionService.getStats(startDate, endDate).subscribe({
            next: (stats) => {
                this.stats = stats;
                this.loading = false;
                
                // Initialize charts if not already done (when data becomes available)
                if (!this.expenseChart || !this.incomeChart) {
                    setTimeout(() => {
                        this.initCharts();
                        this.updateChartData();
                    }, 100);
                } else {
                    this.updateChartData();
                }
            },
            error: (error) => {
                console.error('Error loading stats:', error);
                this.error = 'Failed to load statistics. Please try again.';
                this.loading = false;
            }
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

    hasExpenseData(): boolean {
        return this.stats?.categoryBreakdown?.some(item => item.type === 'expense') || false;
    }

    hasIncomeData(): boolean {
        return this.stats?.categoryBreakdown?.some(item => item.type === 'income') || false;
    }
}