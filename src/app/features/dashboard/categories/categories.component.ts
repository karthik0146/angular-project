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
    template: `
        <div class="categories-container">
            <div class="header">
                <h2>Categories</h2>
                <button mat-raised-button color="primary" (click)="openCategoryDialog()">
                    <mat-icon>add</mat-icon>
                    Add Category
                </button>
            </div>

            <div class="category-grid">
                <div class="category-type">
                    <h3>Income Categories</h3>
                    <div class="categories">
                        <mat-card *ngFor="let category of incomeCategories" class="category-card"
                            [style.borderColor]="category.color">
                            <mat-card-content>
                                <div class="category-icon" [style.backgroundColor]="category.color">
                                    <mat-icon>{{ category.icon }}</mat-icon>
                                </div>
                                <div class="category-info">
                                    <h4>{{ category.name }}</h4>
                                    <div class="category-actions" *ngIf="!category.isDefault">
                                        <button mat-icon-button (click)="openCategoryDialog(category)">
                                            <mat-icon>edit</mat-icon>
                                        </button>
                                        <button mat-icon-button color="warn" (click)="deleteCategory(category)">
                                            <mat-icon>delete</mat-icon>
                                        </button>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </div>

                <div class="category-type">
                    <h3>Expense Categories</h3>
                    <div class="categories">
                        <mat-card *ngFor="let category of expenseCategories" class="category-card"
                            [style.borderColor]="category.color">
                            <mat-card-content>
                                <div class="category-icon" [style.backgroundColor]="category.color">
                                    <mat-icon>{{ category.icon }}</mat-icon>
                                </div>
                                <div class="category-info">
                                    <h4>{{ category.name }}</h4>
                                    <div class="category-actions" *ngIf="!category.isDefault">
                                        <button mat-icon-button (click)="openCategoryDialog(category)">
                                            <mat-icon>edit</mat-icon>
                                        </button>
                                        <button mat-icon-button color="warn" (click)="deleteCategory(category)">
                                            <mat-icon>delete</mat-icon>
                                        </button>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .categories-container {
            padding: 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;

            h2 {
                margin: 0;
            }
        }

        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .category-type {
            h3 {
                margin-bottom: 16px;
                color: #666;
            }
        }

        .categories {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
        }

        .category-card {
            border-left: 4px solid;

            mat-card-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
            }
        }

        .category-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;

            mat-icon {
                color: white;
            }
        }

        .category-info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
                font-size: 1rem;
            }
        }

        .category-actions {
            display: flex;
            gap: 8px;
            visibility: hidden;
        }

        .category-card:hover .category-actions {
            visibility: visible;
        }
    `]
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