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
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
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