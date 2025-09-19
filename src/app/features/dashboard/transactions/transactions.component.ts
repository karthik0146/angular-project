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
        MatChipsModule
    ],
    template: `
        <div class="transactions-container">
            <div class="filters-panel">
                <form [formGroup]="filterForm" class="filters-form">
                    <mat-form-field>
                        <mat-label>Date Range</mat-label>
                        <mat-date-range-input [rangePicker]="picker">
                            <input matStartDate formControlName="startDate" placeholder="Start date">
                            <input matEndDate formControlName="endDate" placeholder="End date">
                        </mat-date-range-input>
                        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-date-range-picker #picker></mat-date-range-picker>
                    </mat-form-field>

                    <mat-form-field>
                        <mat-label>Type</mat-label>
                        <mat-select formControlName="type">
                            <mat-option value="">All</mat-option>
                            <mat-option value="income">Income</mat-option>
                            <mat-option value="expense">Expense</mat-option>
                        </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                        <mat-label>Category</mat-label>
                        <mat-select formControlName="categoryId">
                            <mat-option value="">All</mat-option>
                            <mat-option *ngFor="let category of categories" [value]="category._id">
                                {{ category.name }}
                            </mat-option>
                        </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                        <mat-label>Search</mat-label>
                        <input matInput formControlName="search" placeholder="Search transactions...">
                    </mat-form-field>

                    <button mat-raised-button color="primary" (click)="applyFilters()">
                        Apply Filters
                    </button>

                    <button mat-raised-button (click)="resetFilters()">
                        Reset
                    </button>
                </form>

                <button mat-raised-button color="primary" class="add-button" (click)="openTransactionDialog()">
                    <mat-icon>add</mat-icon>
                    Add Transaction
                </button>
            </div>

            <div class="transactions-table-container">
                <table mat-table [dataSource]="transactions" matSort>
                    <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                        <td mat-cell *matCellDef="let transaction">
                            {{ transaction.date | date:'mediumDate' }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="type">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                        <td mat-cell *matCellDef="let transaction">
                            <span [class]="transaction.type">
                                {{ transaction.type | titlecase }}
                            </span>
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="category">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                        <td mat-cell *matCellDef="let transaction">
                            {{ getCategoryName(transaction.categoryId) }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                        <td mat-cell *matCellDef="let transaction" [class.income]="transaction.type === 'income'"
                            [class.expense]="transaction.type === 'expense'">
                            ₹{{ transaction.amount | number:'1.2-2' }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="notes">
                        <th mat-header-cell *matHeaderCellDef>Notes</th>
                        <td mat-cell *matCellDef="let transaction">{{ transaction.notes }}</td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Actions</th>
                        <td mat-cell *matCellDef="let transaction">
                            <button mat-icon-button (click)="openTransactionDialog(transaction)">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteTransaction(transaction)">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 100]"
                    [length]="totalTransactions"></mat-paginator>
            </div>
        </div>
    `,
    styles: [`
        .transactions-container {
            padding: 20px;
        }

        .filters-panel {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 20px;
        }

        .filters-form {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
            flex: 1;
        }

        .add-button {
            margin-left: 16px;
        }

        .transactions-table-container {
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100%;
        }

        .mat-column-date {
            min-width: 120px;
        }

        .mat-column-type {
            min-width: 100px;
        }

        .mat-column-category {
            min-width: 120px;
        }

        .mat-column-amount {
            min-width: 100px;
        }

        .mat-column-notes {
            min-width: 200px;
        }

        .mat-column-actions {
            min-width: 100px;
            text-align: right;
        }

        .income {
            color: #4caf50;
        }

        .expense {
            color: #f44336;
        }

        mat-form-field {
            flex: 1;
            min-width: 200px;
            max-width: 300px;
        }
    `]
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
        this.categoryService.getCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    loadTransactions(): void {
        const filters: TransactionFilters = {
            ...this.filterForm.value,
            page: this.paginator?.pageIndex + 1 || 1,
            limit: this.paginator?.pageSize || 10,
            sortBy: this.sort?.active,
            sortOrder: this.sort?.direction || 'desc'
        };

        this.transactionService.getTransactions(filters).subscribe(response => {
            this.transactions = response.transactions;
            this.totalTransactions = response.pagination.total;
        });
    }

    getCategoryName(categoryId: string): string {
        return this.categories.find(c => c._id === categoryId)?.name || '';
    }

    applyFilters(): void {
        this.paginator.firstPage();
        this.loadTransactions();
    }

    resetFilters(): void {
        this.filterForm.reset();
        this.paginator.firstPage();
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
                        error: () => {
                            this.snackBar.open('Error updating transaction', 'Close', { duration: 3000 });
                        }
                    });
                } else {
                    this.transactionService.createTransaction(formData).subscribe({
                        next: () => {
                            this.snackBar.open('Transaction created successfully', 'Close', { duration: 3000 });
                            this.loadTransactions();
                        },
                        error: () => {
                            this.snackBar.open('Error creating transaction', 'Close', { duration: 3000 });
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
                error: () => {
                    this.snackBar.open('Error deleting transaction', 'Close', { duration: 3000 });
                }
            });
        }
    }
}