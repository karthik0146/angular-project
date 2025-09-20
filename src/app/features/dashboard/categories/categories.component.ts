import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, Category } from '../../../core/services/category.service';
import { CategoryDialogComponent } from './category-dialog.component';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
    categories: Category[] = [];

    constructor(
        private categoryService: CategoryService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadCategories();
    }

    get incomeCategories(): Category[] {
        return this.categories.filter(c => c.type === 'income');
    }

    get expenseCategories(): Category[] {
        return this.categories.filter(c => c.type === 'expense');
    }

    loadCategories(): void {
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

    openCategoryDialog(category?: Category): void {
        const dialogRef = this.dialog.open(CategoryDialogComponent, {
            width: '400px',
            data: { category }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (category) {
                    this.categoryService.updateCategory(category._id, result).subscribe({
                        next: () => {
                            this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
                            this.loadCategories();
                        },
                        error: (error) => {
                            let errorMessage = 'Error updating category';
                            if (error?.error?.error) {
                                errorMessage = error.error.error;
                            } else if (error?.error?.errors && error.error.errors.length > 0) {
                                errorMessage = error.error.errors[0].msg;
                            }
                            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                        }
                    });
                } else {
                    this.categoryService.createCategory(result).subscribe({
                        next: () => {
                            this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
                            this.loadCategories();
                        },
                        error: (error) => {
                            let errorMessage = 'Error creating category';
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

    deleteCategory(category: Category): void {
        if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
            this.categoryService.deleteCategory(category._id).subscribe({
                next: () => {
                    this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
                    this.loadCategories();
                },
                error: (error) => {
                    let errorMessage = 'Error deleting category';
                    if (error?.error?.error) {
                        errorMessage = error.error.error;
                    }
                    this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                }
            });
        }
    }
}