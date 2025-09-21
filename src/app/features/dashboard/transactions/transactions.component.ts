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
    templateUrl: './transactions.component.html',
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

    getCategoryName(categoryId: any): string {
        return this.categories.find(c => c._id === categoryId._id)?.name || '';
        
   
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