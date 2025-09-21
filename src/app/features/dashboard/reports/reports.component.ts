import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { 
    Chart, 
    ChartConfiguration, 
    LinearScale, 
    BarController, 
    CategoryScale, 
    BarElement, 
    PieController, 
    ArcElement, 
    Legend, 
    Tooltip, 
    LineController, 
    LineElement,
    PointElement
} from 'chart.js';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionService, TransactionFilters, Transaction } from '../../../core/services/transaction.service';
import { CategoryService, Category } from '../../../core/services/category.service';

// Register Chart.js components
Chart.register(
    LinearScale,
    BarController,
    CategoryScale,
    BarElement,
    PieController,
    ArcElement,
    Legend,
    Tooltip,
    LineController,
    LineElement,
    PointElement
);

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('barChart') barChart!: ElementRef;
    @ViewChild('incomeChart') incomeChart!: ElementRef;
    @ViewChild('expenseChart') expenseChart!: ElementRef;
    @ViewChild('lineChart') lineChart!: ElementRef;
    
    filterForm: FormGroup;
    loading = false;
    error: string | null = null;
    hasData = false;
    
    private barChartInstance?: Chart;
    private incomeChartInstance?: Chart;
    private expenseChartInstance?: Chart;
    private lineChartInstance?: Chart;

    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: window.innerWidth < 768 ? 'bottom' : 'top',
                labels: {
                    boxWidth: window.innerWidth < 768 ? 12 : 15,
                    padding: window.innerWidth < 768 ? 8 : 15,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            tooltip: {
                titleFont: {
                    size: window.innerWidth < 768 ? 12 : 14
                },
                bodyFont: {
                    size: window.innerWidth < 768 ? 10 : 12
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        }
    };

    pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: window.innerWidth < 768 ? 'bottom' : 'right',
                labels: {
                    boxWidth: window.innerWidth < 768 ? 12 : 15,
                    padding: window.innerWidth < 768 ? 8 : 15,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            tooltip: {
                titleFont: {
                    size: window.innerWidth < 768 ? 12 : 14
                },
                bodyFont: {
                    size: window.innerWidth < 768 ? 10 : 12
                }
            }
        }
    };

    lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: window.innerWidth < 768 ? 'bottom' : 'top',
                labels: {
                    boxWidth: window.innerWidth < 768 ? 12 : 15,
                    padding: window.innerWidth < 768 ? 8 : 15,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            tooltip: {
                titleFont: {
                    size: window.innerWidth < 768 ? 12 : 14
                },
                bodyFont: {
                    size: window.innerWidth < 768 ? 10 : 12
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
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

    private categories: Category[] = [];

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private categoryService: CategoryService
    ) {
        console.log('=== REPORTS COMPONENT CONSTRUCTOR ===');
        this.filterForm = this.fb.group({
            reportType: ['monthly'],
            date: [new Date()]
        });
        console.log('Form initialized:', this.filterForm.value);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        // Debounce resize events
        setTimeout(() => {
            this.updateChartResponsiveness();
        }, 100);
    }

    private updateChartResponsiveness(): void {
        const isMobile = window.innerWidth < 768;
        
        // Simply resize charts without changing options to avoid type issues
        if (this.barChartInstance) {
            this.barChartInstance.resize();
        }
        if (this.incomeChartInstance) {
            this.incomeChartInstance.resize();
        }
        if (this.expenseChartInstance) {
            this.expenseChartInstance.resize();
        }
        if (this.lineChartInstance) {
            this.lineChartInstance.resize();
        }
    }

    ngOnInit(): void {
        console.log('=== REPORTS COMPONENT INIT ===');
        console.log('Loading categories and generating initial report...');
        
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                console.log('Categories loaded:', categories);
                this.categories = categories;
                this.generateReport();
            },
            error: (error) => {
                console.error('Error loading categories:', error);
                this.error = 'Failed to load categories';
                this.loading = false;
            }
        });
        
        this.filterForm.get('reportType')?.valueChanges.subscribe(() => {
            console.log('Report type changed, regenerating report...');
            this.generateReport();
        });
    }

    ngAfterViewInit(): void {
        console.log('=== REPORTS COMPONENT AFTER VIEW INIT ===');
        console.log('View elements:', {
            barChart: !!this.barChart,
            incomeChart: !!this.incomeChart,
            expenseChart: !!this.expenseChart,
            lineChart: !!this.lineChart
        });
        
        // Don't initialize charts here - let the data loading process handle it
        // Charts will be initialized when data is ready
        console.log('Chart elements ready, waiting for data to initialize charts...');
    }

    ngOnDestroy(): void {
        this.destroyCharts();
    }

    generateReport(): void {
        console.log('=== GENERATE REPORT CALLED ===');
        const date = this.filterForm.get('date')?.value;
        const reportType = this.filterForm.get('reportType')?.value;

        console.log('Report parameters:', { date, reportType });

        let startDate: Date;
        let endDate: Date;

        if (reportType === 'monthly') {
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            console.log('Generating monthly report from', startDate, 'to', endDate);
            this.generateMonthlyReport(startDate, endDate);
        } else {
            startDate = new Date(date.getFullYear(), 0, 1);
            endDate = new Date(date.getFullYear(), 11, 31);
            console.log('Generating yearly report from', startDate, 'to', endDate);
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
        try {
            if (this.barChartInstance) {
                this.barChartInstance.destroy();
                this.barChartInstance = undefined;
            }
            if (this.incomeChartInstance) {
                this.incomeChartInstance.destroy();
                this.incomeChartInstance = undefined;
            }
            if (this.expenseChartInstance) {
                this.expenseChartInstance.destroy();
                this.expenseChartInstance = undefined;
            }
            if (this.lineChartInstance) {
                this.lineChartInstance.destroy();
                this.lineChartInstance = undefined;
            }
        } catch (error) {
            console.error('Error destroying charts:', error);
        }
    }

    private initializeCharts(): void {
        console.log('initializeCharts called');
        console.log('Current chart data:', {
            barChartData: this.barChartData,
            incomePieChartData: this.incomePieChartData,
            expensePieChartData: this.expensePieChartData,
            lineChartData: this.lineChartData
        });
        
        try {
            if (!this.barChart?.nativeElement || !this.incomeChart?.nativeElement || 
                !this.expenseChart?.nativeElement || !this.lineChart?.nativeElement) {
                console.warn('Chart elements not found:', {
                    barChart: !!this.barChart?.nativeElement,
                    incomeChart: !!this.incomeChart?.nativeElement,
                    expenseChart: !!this.expenseChart?.nativeElement,
                    lineChart: !!this.lineChart?.nativeElement
                });
                return;
            }

            this.destroyCharts();

            const barCtx = this.barChart.nativeElement.getContext('2d');
            const incomeCtx = this.incomeChart.nativeElement.getContext('2d');
            const expenseCtx = this.expenseChart.nativeElement.getContext('2d');
            const lineCtx = this.lineChart.nativeElement.getContext('2d');

            if (barCtx && incomeCtx && expenseCtx && lineCtx) {
                console.log('Creating bar chart with data:', this.barChartData);
                this.barChartInstance = new Chart(barCtx, {
                    type: 'bar',
                    data: this.barChartData,
                    options: {
                        ...this.barChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                console.log('Creating income pie chart with data:', this.incomePieChartData);
                this.incomeChartInstance = new Chart(incomeCtx, {
                    type: 'pie',
                    data: this.incomePieChartData,
                    options: {
                        ...this.pieChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                console.log('Creating expense pie chart with data:', this.expensePieChartData);
                this.expenseChartInstance = new Chart(expenseCtx, {
                    type: 'pie',
                    data: this.expensePieChartData,
                    options: {
                        ...this.pieChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                console.log('Creating line chart with data:', this.lineChartData);
                this.lineChartInstance = new Chart(lineCtx, {
                    type: 'line',
                    data: this.lineChartData,
                    options: {
                        ...this.lineChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                console.log('All charts initialized successfully');
            } else {
                console.error('Failed to get canvas contexts');
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    private renderChartsWithData(): void {
        console.log('=== RENDERING CHARTS WITH DATA ===');
        console.log('Chart elements available:', {
            barChart: !!this.barChart?.nativeElement,
            incomeChart: !!this.incomeChart?.nativeElement,
            expenseChart: !!this.expenseChart?.nativeElement,
            lineChart: !!this.lineChart?.nativeElement
        });

        // Ensure all chart elements are available
        if (!this.barChart?.nativeElement || !this.incomeChart?.nativeElement || 
            !this.expenseChart?.nativeElement || !this.lineChart?.nativeElement) {
            console.error('Chart elements not ready yet, retrying...');
            setTimeout(() => this.renderChartsWithData(), 200);
            return;
        }

        // Destroy existing charts
        this.destroyCharts();

        // Create new charts with current data
        try {
            const barCtx = this.barChart.nativeElement.getContext('2d');
            const incomeCtx = this.incomeChart.nativeElement.getContext('2d');
            const expenseCtx = this.expenseChart.nativeElement.getContext('2d');
            const lineCtx = this.lineChart.nativeElement.getContext('2d');

            if (barCtx && incomeCtx && expenseCtx && lineCtx) {
                console.log('Creating charts with data...');

                // Bar Chart
                this.barChartInstance = new Chart(barCtx, {
                    type: 'bar',
                    data: this.barChartData,
                    options: {
                        ...this.barChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                // Income Pie Chart
                this.incomeChartInstance = new Chart(incomeCtx, {
                    type: 'pie',
                    data: this.incomePieChartData,
                    options: {
                        ...this.pieChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                // Expense Pie Chart
                this.expenseChartInstance = new Chart(expenseCtx, {
                    type: 'pie',
                    data: this.expensePieChartData,
                    options: {
                        ...this.pieChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                // Line Chart
                this.lineChartInstance = new Chart(lineCtx, {
                    type: 'line',
                    data: this.lineChartData,
                    options: {
                        ...this.lineChartOptions,
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                console.log('All charts created successfully!');
                console.log('Final chart data:', {
                    barData: this.barChartData,
                    incomeData: this.incomePieChartData,
                    expenseData: this.expensePieChartData,
                    lineData: this.lineChartData
                });
            } else {
                console.error('Could not get chart contexts');
            }
        } catch (error) {
            console.error('Error creating charts:', error);
        }
    }

    private updateCharts(): void {
        console.log('updateCharts called');
        console.log('Chart instances:', {
            barChart: !!this.barChartInstance,
            incomeChart: !!this.incomeChartInstance,
            expenseChart: !!this.expenseChartInstance,
            lineChart: !!this.lineChartInstance
        });

        if (this.barChartInstance && this.incomeChartInstance && 
            this.expenseChartInstance && this.lineChartInstance) {
            
            console.log('Updating existing charts with new data');
            
            // Update all charts with new data
            this.barChartInstance.data = this.barChartData;
            this.barChartInstance.update('none');
            console.log('Bar chart updated');

            this.incomeChartInstance.data = this.incomePieChartData;
            this.incomeChartInstance.update('none');
            console.log('Income chart updated with data:', this.incomePieChartData);

            this.expenseChartInstance.data = this.expensePieChartData;
            this.expenseChartInstance.update('none');
            console.log('Expense chart updated with data:', this.expensePieChartData);

            this.lineChartInstance.data = this.lineChartData;
            this.lineChartInstance.update('none');
            console.log('Line chart updated');
        } else {
            console.log('Charts not initialized, initializing now...');
            // Initialize charts if they don't exist
            this.initializeCharts();
        }
    }

    private generateMonthlyReport(startDate: Date, endDate: Date): void {
        console.log('Generating monthly report from', startDate, 'to', endDate);
        this.loading = true;
        this.error = null;
        
        const filters: TransactionFilters = {
            startDate,
            endDate
        };

        this.transactionService.getTransactions(filters).subscribe({
            next: (response) => {
                console.log('Transactions received:', response);
                const transactions = response.transactions;
                console.log('Categories available:', this.categories);
                
                if (!transactions || transactions.length === 0) {
                    console.log('No transactions found for the selected period');
                    this.hasData = false;
                    this.loading = false;
                    return;
                }

                this.hasData = true;
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

                this.loading = false;
                console.log('Data processing complete, chart data ready');
                
                // Use a longer timeout to ensure DOM is ready
                setTimeout(() => {
                    console.log('Attempting to render charts...');
                    this.renderChartsWithData();
                }, 300);
            },
            error: (error) => {
                console.error('Error fetching transactions:', error);
                this.error = 'Failed to load report data. Please try again.';
                this.loading = false;
            }
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

    private updatePieCharts(transactions: Transaction[]): void {
        console.log('updatePieCharts called with transactions:', transactions);
        console.log('Available categories:', this.categories);
        
        const incomeByCategory = new Map<string, { amount: number; name: string; color: string }>();
        const expenseByCategory = new Map<string, { amount: number; name: string; color: string }>();

        transactions.forEach((transaction, index) => {
            console.log(`Processing transaction ${index + 1}:`, transaction);
            
            // Handle both populated and non-populated category data
            let category: any;
            if (typeof transaction.categoryId === 'string') {
                // Category is not populated, find it by ID
                category = this.categories.find(c => c._id === transaction.categoryId);
                console.log(`Found category for ID ${transaction.categoryId}:`, category);
            } else if (transaction.categoryId && typeof transaction.categoryId === 'object') {
                // Category is populated
                category = transaction.categoryId as any;
                console.log('Category is populated:', category);
            }

            if (!category) {
                console.warn('Category not found for transaction:', transaction);
                return;
            }

            const map = transaction.type === 'income' ? incomeByCategory : expenseByCategory;
            const categoryId = typeof category === 'object' ? category._id : category;
            const current = map.get(categoryId)?.amount || 0;
            
            map.set(categoryId, {
                amount: current + transaction.amount,
                name: category.name || 'Unknown',
                color: category.color || this.getRandomColor()
            });
        });

        const incomeData = Array.from(incomeByCategory.values());
        const expenseData = Array.from(expenseByCategory.values());

        console.log('Processed income data:', incomeData);
        console.log('Processed expense data:', expenseData);

        // Update income pie chart data
        this.incomePieChartData = {
            labels: incomeData.map(v => v.name || 'Unknown'),
            datasets: [{
                data: incomeData.map(v => v.amount),
                backgroundColor: incomeData.map(v => v.color),
                hoverOffset: 4
            }]
        };

        // Update expense pie chart data
        this.expensePieChartData = {
            labels: expenseData.map(v => v.name || 'Unknown'),
            datasets: [{
                data: expenseData.map(v => v.amount),
                backgroundColor: expenseData.map(v => v.color),
                hoverOffset: 4
            }]
        };

        console.log('Final Income Chart Data:', this.incomePieChartData);
        console.log('Final Expense Chart Data:', this.expensePieChartData);
    }

    private getRandomColor(): string {
        return `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.7)`;
    }
    }
