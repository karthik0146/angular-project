import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Chart, ChartConfiguration } from 'chart.js';
import { TransactionService, TransactionFilters } from '../../../core/services/transaction.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatCardModule
    ],
    template: `
        <div class="reports-container">
            <form [formGroup]="filterForm" class="filters">
                <mat-form-field>
                    <mat-label>Report Type</mat-label>
                    <mat-select formControlName="reportType">
                        <mat-option value="monthly">Monthly</mat-option>
                        <mat-option value="yearly">Yearly</mat-option>
                    </mat-select>
                </mat-form-field>

                <ng-container *ngIf="filterForm.get('reportType')?.value === 'monthly'">
                    <mat-form-field>
                        <mat-label>Month & Year</mat-label>
                        <input matInput [matDatepicker]="monthPicker" formControlName="date">
                        <mat-datepicker-toggle matIconSuffix [for]="monthPicker"></mat-datepicker-toggle>
                        <mat-datepicker #monthPicker
                            startView="multi-year"
                            (yearSelected)="chosenYearHandler($event)"
                            (monthSelected)="chosenMonthHandler($event, monthPicker)">
                        </mat-datepicker>
                    </mat-form-field>
                </ng-container>

                <ng-container *ngIf="filterForm.get('reportType')?.value === 'yearly'">
                    <mat-form-field>
                        <mat-label>Year</mat-label>
                        <input matInput [matDatepicker]="yearPicker" formControlName="date">
                        <mat-datepicker-toggle matIconSuffix [for]="yearPicker"></mat-datepicker-toggle>
                        <mat-datepicker #yearPicker
                            startView="multi-year"
                            (yearSelected)="chosenYearHandler($event, yearPicker)">
                        </mat-datepicker>
                    </mat-form-field>
                </ng-container>

                <button mat-raised-button color="primary" (click)="generateReport()">
                    Generate Report
                </button>
            </form>

            <div class="reports-grid">
                <mat-card class="chart-card">
                    <mat-card-header>
                        <mat-card-title>Income vs Expense</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <canvas #barChart></canvas>
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
                        <mat-card-title>Balance Trend</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <canvas #lineChart></canvas>
                    </mat-card-content>
                </mat-card>
            </div>
        </div>
    `,
    styles: [`
        .reports-container {
            padding: 20px;
        }

        .filters {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 24px;
        }

        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
        }

        .chart-card {
            mat-card-content {
                padding: 16px;
                min-height: 300px;
            }
        }
    `]
})
export class ReportsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('barChart') barChart!: ElementRef;
    @ViewChild('incomeChart') incomeChart!: ElementRef;
    @ViewChild('expenseChart') expenseChart!: ElementRef;
    @ViewChild('lineChart') lineChart!: ElementRef;
    
    filterForm: FormGroup;
    
    private barChartInstance?: Chart;
    private incomeChartInstance?: Chart;
    private expenseChartInstance?: Chart;
    private lineChartInstance?: Chart;

    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    };

    pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right'
            }
        }
    };

    lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    barChartData: ChartConfiguration['data'] = {
        labels: [],
        datasets: [
            {
                label: 'Income',
                data: [],
                backgroundColor: 'rgba(76, 175, 80, 0.5)'
            },
            {
                label: 'Expense',
                data: [],
                backgroundColor: 'rgba(244, 67, 54, 0.5)'
            }
        ]
    };

    incomePieChartData: ChartConfiguration['data'] = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: []
        }]
    };

    expensePieChartData: ChartConfiguration['data'] = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: []
        }]
    };

    lineChartData: ChartConfiguration['data'] = {
        labels: [],
        datasets: [
            {
                label: 'Balance',
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService
    ) {
        this.filterForm = this.fb.group({
            reportType: ['monthly'],
            date: [new Date()]
        });
    }

    ngOnInit(): void {
        this.generateReport();
        this.filterForm.get('reportType')?.valueChanges.subscribe(() => {
            this.generateReport();
        });
    }

    ngAfterViewInit(): void {
        if (this.barChart && this.incomeChart && this.expenseChart && this.lineChart) {
            this.initializeCharts();
        }
    }

    ngOnDestroy(): void {
        this.destroyCharts();
    }

    generateReport(): void {
        const date = this.filterForm.get('date')?.value;
        const reportType = this.filterForm.get('reportType')?.value;

        let startDate: Date;
        let endDate: Date;

        if (reportType === 'monthly') {
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            this.generateMonthlyReport(startDate, endDate);
        } else {
            startDate = new Date(date.getFullYear(), 0, 1);
            endDate = new Date(date.getFullYear(), 11, 31);
            this.generateYearlyReport(startDate, endDate);
        }
    }

    chosenYearHandler(normalizedYear: Date, datepicker?: any): void {
        const ctrlValue = this.filterForm.get('date')?.value || new Date();
        ctrlValue.setFullYear(normalizedYear.getFullYear());
        this.filterForm.get('date')?.setValue(ctrlValue);
        if (this.filterForm.get('reportType')?.value === 'yearly' && datepicker) {
            datepicker.close();
        }
    }

    chosenMonthHandler(normalizedMonth: Date, datepicker: any): void {
        const ctrlValue = this.filterForm.get('date')?.value || new Date();
        ctrlValue.setMonth(normalizedMonth.getMonth());
        this.filterForm.get('date')?.setValue(ctrlValue);
        datepicker.close();
        this.generateReport();
    }

    private destroyCharts(): void {
        this.barChartInstance?.destroy();
        this.incomeChartInstance?.destroy();
        this.expenseChartInstance?.destroy();
        this.lineChartInstance?.destroy();
    }

    private initializeCharts(): void {
        if (!this.barChart?.nativeElement || !this.incomeChart?.nativeElement || 
            !this.expenseChart?.nativeElement || !this.lineChart?.nativeElement) {
            return;
        }

        const barCtx = this.barChart.nativeElement.getContext('2d');
        const incomeCtx = this.incomeChart.nativeElement.getContext('2d');
        const expenseCtx = this.expenseChart.nativeElement.getContext('2d');
        const lineCtx = this.lineChart.nativeElement.getContext('2d');

        if (barCtx && incomeCtx && expenseCtx && lineCtx) {
            this.destroyCharts();

            this.barChartInstance = new Chart(barCtx, {
                type: 'bar',
                data: this.barChartData,
                options: this.barChartOptions
            });

            this.incomeChartInstance = new Chart(incomeCtx, {
                type: 'pie',
                data: this.incomePieChartData,
                options: this.pieChartOptions
            });

            this.expenseChartInstance = new Chart(expenseCtx, {
                type: 'pie',
                data: this.expensePieChartData,
                options: this.pieChartOptions
            });

            this.lineChartInstance = new Chart(lineCtx, {
                type: 'line',
                data: this.lineChartData,
                options: this.lineChartOptions
            });
        }
    }

    private updateCharts(): void {
        if (this.barChartInstance && this.incomeChartInstance && 
            this.expenseChartInstance && this.lineChartInstance) {
            // Update all charts with new data
            this.barChartInstance.data = this.barChartData;
            this.barChartInstance.update('none');

            this.incomeChartInstance.data = this.incomePieChartData;
            this.incomeChartInstance.update('none');

            this.expenseChartInstance.data = this.expensePieChartData;
            this.expenseChartInstance.update('none');

            this.lineChartInstance.data = this.lineChartData;
            this.lineChartInstance.update('none');
        } else {
            // Initialize charts if they don't exist
            this.initializeCharts();
        }
    }

    private generateMonthlyReport(startDate: Date, endDate: Date): void {
        const filters: TransactionFilters = {
            startDate,
            endDate
        };

        this.transactionService.getTransactions(filters).subscribe(response => {
            const transactions = response.transactions;
            const days = Array.from({ length: endDate.getDate() }, (_, i) => i + 1);

            // Process data for bar chart
            const incomeData = new Array(days.length).fill(0);
            const expenseData = new Array(days.length).fill(0);

            transactions.forEach(transaction => {
                const day = new Date(transaction.date).getDate() - 1;
                if (transaction.type === 'income') {
                    incomeData[day] += transaction.amount;
                } else {
                    expenseData[day] += transaction.amount;
                }
            });

            this.barChartData = {
                labels: days.map(d => d.toString()),
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(76, 175, 80, 0.5)'
                    },
                    {
                        label: 'Expense',
                        data: expenseData,
                        backgroundColor: 'rgba(244, 67, 54, 0.5)'
                    }
                ]
            };

            // Process data for pie charts
            this.updatePieCharts(transactions);

            // Process data for line chart
            const balanceData = days.map((_, index) => {
                let balance = 0;
                transactions
                    .filter(t => new Date(t.date).getDate() <= index + 1)
                    .forEach(t => {
                        balance += t.type === 'income' ? t.amount : -t.amount;
                    });
                return balance;
            });

            this.lineChartData = {
                labels: days.map(d => d.toString()),
                datasets: [{
                    label: 'Balance',
                    data: balanceData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };

            // Update all charts with new data
            this.updateCharts();
        });
    }

    private generateYearlyReport(startDate: Date, endDate: Date): void {
        const filters: TransactionFilters = {
            startDate,
            endDate
        };

        this.transactionService.getTransactions(filters).subscribe(response => {
            const transactions = response.transactions;
            const months = Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2000, i, 1);
                return date.toLocaleString('default', { month: 'short' });
            });

            // Process data for bar chart
            const incomeData = new Array(12).fill(0);
            const expenseData = new Array(12).fill(0);

            transactions.forEach(transaction => {
                const month = new Date(transaction.date).getMonth();
                if (transaction.type === 'income') {
                    incomeData[month] += transaction.amount;
                } else {
                    expenseData[month] += transaction.amount;
                }
            });

            this.barChartData = {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(76, 175, 80, 0.5)'
                    },
                    {
                        label: 'Expense',
                        data: expenseData,
                        backgroundColor: 'rgba(244, 67, 54, 0.5)'
                    }
                ]
            };

            // Process data for pie charts
            this.updatePieCharts(transactions);

            // Process data for line chart
            const balanceData = months.map((_, index) => {
                let balance = 0;
                transactions
                    .filter(t => new Date(t.date).getMonth() <= index)
                    .forEach(t => {
                        balance += t.type === 'income' ? t.amount : -t.amount;
                    });
                return balance;
            });

            this.lineChartData = {
                labels: months,
                datasets: [{
                    label: 'Balance',
                    data: balanceData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };

            // Update all charts with new data
            this.updateCharts();
        });
    }

    private updatePieCharts(transactions: any[]): void {
        const incomeByCategory = new Map<string, number>();
        const expenseByCategory = new Map<string, number>();

        transactions.forEach(transaction => {
            const map = transaction.type === 'income' ? incomeByCategory : expenseByCategory;
            const current = map.get(transaction.categoryId) || 0;
            map.set(transaction.categoryId, current + transaction.amount);
        });

        // Update income pie chart data
        this.incomePieChartData = {
            labels: Array.from(incomeByCategory.keys()),
            datasets: [{
                data: Array.from(incomeByCategory.values()),
                backgroundColor: Array.from(incomeByCategory.keys()).map(() => 
                    `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
                )
            }]
        };

        // Update expense pie chart data
        this.expensePieChartData = {
            labels: Array.from(expenseByCategory.keys()),
            datasets: [{
                data: Array.from(expenseByCategory.values()),
                backgroundColor: Array.from(expenseByCategory.keys()).map(() => 
                    `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
                )
            }]
        };
    }
}