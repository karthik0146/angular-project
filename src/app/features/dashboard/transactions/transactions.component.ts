import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransactionService, Transaction, TransactionFilters } from '../../../core/services/transaction.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { TransactionDialogComponent } from './transaction-dialog.component';

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatChipsModule,
        MatTooltipModule
    ],
    template: `
        <div class="transactions-container">
            <!-- Header with title and add button -->
            <div class="header-section">
                <h2>Transactions</h2>
                <button mat-raised-button color="primary" class="add-button" (click)="openTransactionDialog()">
                    <mat-icon>add</mat-icon>
                    <span class="button-text">Add Transaction</span>
                </button>
            </div>

            <!-- Filters Panel -->
            <div class="filters-panel">
                <form [formGroup]="filterForm" class="filters-form">
                    <div class="filter-row">
                        <mat-form-field class="date-range-field">
                            <mat-label>Date Range</mat-label>
                            <mat-date-range-input [rangePicker]="picker">
                                <input matStartDate formControlName="startDate" placeholder="Start date">
                                <input matEndDate formControlName="endDate" placeholder="End date">
                            </mat-date-range-input>
                            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                            <mat-date-range-picker #picker></mat-date-range-picker>
                        </mat-form-field>

                        <mat-form-field class="type-field">
                            <mat-label>Type</mat-label>
                            <mat-select formControlName="type">
                                <mat-option value="">All</mat-option>
                                <mat-option value="income">Income</mat-option>
                                <mat-option value="expense">Expense</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field class="category-field">
                            <mat-label>Category</mat-label>
                            <mat-select formControlName="categoryId">
                                <mat-option value="">All</mat-option>
                                <mat-option *ngFor="let category of categories" [value]="category._id">
                                    {{ category.name }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="filter-row">
                        <mat-form-field class="search-field">
                            <mat-label>Search</mat-label>
                            <input matInput formControlName="search" placeholder="Search transactions...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <div class="filter-actions">
                            <button mat-raised-button color="primary" (click)="applyFilters()" type="button">
                                <mat-icon>filter_list</mat-icon>
                                <span class="button-text">Apply</span>
                            </button>

                            <button mat-button (click)="resetFilters()" type="button">
                                <mat-icon>clear</mat-icon>
                                <span class="button-text">Reset</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Transactions Content -->
            <div class="transactions-content">
                <!-- Desktop Table View -->
                <div class="table-container desktop-view">
                    <table mat-table [dataSource]="transactions" matSort class="transactions-table">
                        <ng-container matColumnDef="date">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                            <td mat-cell *matCellDef="let transaction">
                                {{ transaction.date | date:'mediumDate' }}
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="type">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                            <td mat-cell *matCellDef="let transaction">
                                <span class="type-badge" [ngClass]="transaction.type">
                                    {{ transaction.type | titlecase }}
                                </span>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="category">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                            <td mat-cell *matCellDef="let transaction">
                                <span class="category-name">{{ getCategoryName(transaction.categoryId) }}</span>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="amount">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                            <td mat-cell *matCellDef="let transaction">
                                <span class="amount" [ngClass]="transaction.type">
                                    ₹{{ transaction.amount | number:'1.2-2' }}
                                </span>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="notes">
                            <th mat-header-cell *matHeaderCellDef>Notes</th>
                            <td mat-cell *matCellDef="let transaction">
                                <span class="notes" [title]="transaction.notes">{{ transaction.notes }}</span>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let transaction">
                                <div class="action-buttons">
                                    <button mat-icon-button (click)="openTransactionDialog(transaction)" 
                                            matTooltip="Edit">
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button mat-icon-button color="warn" (click)="deleteTransaction(transaction)"
                                            matTooltip="Delete">
                                        <mat-icon>delete</mat-icon>
                                    </button>
                                </div>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="transaction-row"></tr>
                    </table>
                </div>

                <!-- Mobile Card View -->
                <div class="mobile-view">
                    <div class="transaction-card" *ngFor="let transaction of transactions" 
                         [ngClass]="transaction.type">
                        <div class="card-header">
                            <div class="date-type">
                                <span class="date">{{ transaction.date | date:'mediumDate' }}</span>
                                <span class="type-badge" [ngClass]="transaction.type">
                                    {{ transaction.type | titlecase }}
                                </span>
                            </div>
                            <div class="amount" [ngClass]="transaction.type">
                                ₹{{ transaction.amount | number:'1.2-2' }}
                            </div>
                        </div>
                        
                        <div class="card-content">
                            <div class="category">
                                <mat-icon>category</mat-icon>
                                <span>{{ getCategoryName(transaction.categoryId) }}</span>
                            </div>
                            <div class="notes" *ngIf="transaction.notes">
                                <mat-icon>note</mat-icon>
                                <span>{{ transaction.notes }}</span>
                            </div>
                        </div>
                        
                        <div class="card-actions">
                            <button mat-icon-button (click)="openTransactionDialog(transaction)">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteTransaction(transaction)">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 100]"
                               [length]="totalTransactions"
                               class="pagination">
                </mat-paginator>
            </div>
        </div>
    `,
    styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<Transaction>;

    transactions: Transaction[] = [];
    categories: Category[] = [];
    totalTransactions = 0;
    displayedColumns = ['date', 'type', 'category', 'amount', 'notes', 'actions'];
    filterForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.filterForm = this.fb.group({
            startDate: [''],
            endDate: [''],
            type: [''],
            categoryId: [''],
            search: ['']
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.loadTransactions();
    }

    private loadCategories(): void {
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (error) => {
                let errorMessage = 'Error loading categories';
                if (error?.error?.error) {
                    errorMessage = error.error.error;
                }
                this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
            }
        });
    }

    loadTransactions(): void {
        const pageIndex = this.paginator?.pageIndex || 0;
        const pageSize = this.paginator?.pageSize || 10;
        const sortBy = this.sort?.active || 'date';
        const sortOrder = this.sort?.direction || 'desc';
        
        const filters: TransactionFilters = {
            ...this.filterForm.value,
            page: pageIndex + 1,
            limit: pageSize,
            sortBy: sortBy,
            sortOrder: sortOrder
        };

        this.transactionService.getTransactions(filters).subscribe({
            next: (response) => {
                this.transactions = response.transactions;
                this.totalTransactions = response.pagination.total;
            },
            error: (error) => {
                let errorMessage = 'Error loading transactions';
                if (error?.error?.error) {
                    errorMessage = error.error.error;
                }
                this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
            }
        });
    }

    getCategoryName(categoryId: string): string {
        return this.categories.find(c => c._id === categoryId)?.name || '';
    }

    applyFilters(): void {
        if (this.paginator) {
            this.paginator.firstPage();
        }
        this.loadTransactions();
    }

    resetFilters(): void {
        this.filterForm.reset();
        if (this.paginator) {
            this.paginator.firstPage();
        }
        this.loadTransactions();
    }

    openTransactionDialog(transaction?: Transaction): void {
        const dialogRef = this.dialog.open(TransactionDialogComponent, {
            width: '500px',
            data: {
                transaction,
                categories: this.categories
            }
        });

        dialogRef.afterClosed().subscribe((formData: FormData) => {
            if (formData) {
                if (transaction) {
                    this.transactionService.updateTransaction(transaction._id, formData).subscribe({
                        next: () => {
                            this.snackBar.open('Transaction updated successfully', 'Close', { duration: 3000 });
                            this.loadTransactions();
                        },
                        error: (error) => {
                            let errorMessage = 'Error updating transaction';
                            if (error?.error?.error) {
                                errorMessage = error.error.error;
                            } else if (error?.error?.errors && error.error.errors.length > 0) {
                                errorMessage = error.error.errors[0].msg;
                            }
                            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                        }
                    });
                } else {
                    this.transactionService.createTransaction(formData).subscribe({
                        next: () => {
                            this.snackBar.open('Transaction created successfully', 'Close', { duration: 3000 });
                            this.loadTransactions();
                        },
                        error: (error) => {
                            let errorMessage = 'Error creating transaction';
                            if (error?.error?.error) {
                                errorMessage = error.error.error;
                            } else if (error?.error?.errors && error.error.errors.length > 0) {
                                errorMessage = error.error.errors[0].msg;
                            }
                            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                        }
                    });
                }
            }
        });
    }

    deleteTransaction(transaction: Transaction): void {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactionService.deleteTransaction(transaction._id).subscribe({
                next: () => {
                    this.snackBar.open('Transaction deleted successfully', 'Close', { duration: 3000 });
                    this.loadTransactions();
                },
                error: (error) => {
                    let errorMessage = 'Error deleting transaction';
                    if (error?.error?.error) {
                        errorMessage = error.error.error;
                    }
                    this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                }
            });
        }
    }
}