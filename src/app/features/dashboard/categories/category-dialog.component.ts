import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../../core/services/category.service';

interface DialogData {
    category?: Category;
}

interface IconOption {
    name: string;
    value: string;
}

@Component({
    selector: 'app-category-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './category-dialog.component.html',
    styleUrls: ['./category-dialog.component.scss']
})
export class CategoryDialogComponent {
    categoryForm: FormGroup;
    icons: IconOption[] = [
        { name: 'Shopping', value: 'shopping_cart' },
        { name: 'Food', value: 'restaurant' },
        { name: 'Transport', value: 'directions_car' },
        { name: 'Bills', value: 'receipt' },
        { name: 'Entertainment', value: 'movie' },
        { name: 'Health', value: 'local_hospital' },
        { name: 'Education', value: 'school' },
        { name: 'Travel', value: 'flight' },
        { name: 'Salary', value: 'account_balance' },
        { name: 'Investment', value: 'trending_up' },
        { name: 'Gift', value: 'card_giftcard' },
        { name: 'Other', value: 'category' }
    ];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CategoryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.categoryForm = this.fb.group({
            name: [data.category?.name || '', Validators.required],
            type: [data.category?.type || 'expense', Validators.required],
            icon: [data.category?.icon || 'category'],
            color: [data.category?.color || '#000000']
        });

        if (data.category) {
            this.categoryForm.get('type')?.disable();
        }
    }

    onSubmit(): void {
        if (this.categoryForm.valid) {
            const formValue = { ...this.categoryForm.value };
            // Remove type for updates since it shouldn't be changed
            if (this.data.category) {
                delete formValue.type;
            }
            this.dialogRef.close(formValue);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}