import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Transaction } from '../../../core/services/transaction.service';
import { Category } from '../../../core/services/category.service';

interface DialogData {
    transaction?: Transaction;
    categories: Category[];
}

@Component({
    selector: 'app-transaction-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule
    ],
    template: `
        <h2 mat-dialog-title>{{ data.transaction ? 'Edit' : 'Add' }} Transaction</h2>
        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
            <div mat-dialog-content>
                <mat-form-field appearance="outline">
                    <mat-label>Type</mat-label>
                    <mat-select formControlName="type">
                        <mat-option value="income">Income</mat-option>
                        <mat-option value="expense">Expense</mat-option>
                    </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Amount</mat-label>
                    <input matInput type="number" formControlName="amount">
                    <mat-error *ngIf="transactionForm.get('amount')?.errors?.['required']">
                        Amount is required
                    </mat-error>
                    <mat-error *ngIf="transactionForm.get('amount')?.errors?.['min']">
                        Amount must be greater than 0
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Date</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="date">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Category</mat-label>
                    <mat-select formControlName="categoryId">
                        <mat-option *ngFor="let category of filteredCategories" [value]="category._id">
                            {{ category.name }}
                        </mat-option>
                    </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Notes</mat-label>
                    <textarea matInput formControlName="notes" rows="3"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Tags</mat-label>
                    <mat-chip-grid #chipGrid aria-label="Tags">
                        <mat-chip-row *ngFor="let tag of tags"
                            (removed)="removeTag(tag)">
                            {{tag}}
                            <button matChipRemove>
                                <mat-icon>cancel</mat-icon>
                            </button>
                        </mat-chip-row>
                    </mat-chip-grid>
                    <input placeholder="New tag..."
                        [matChipInputFor]="chipGrid"
                        [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                        (matChipInputTokenEnd)="addTag($event)">
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>Recurring Type</mat-label>
                    <mat-select formControlName="recurringType">
                        <mat-option value="none">None</mat-option>
                        <mat-option value="daily">Daily</mat-option>
                        <mat-option value="weekly">Weekly</mat-option>
                        <mat-option value="monthly">Monthly</mat-option>
                        <mat-option value="yearly">Yearly</mat-option>
                    </mat-select>
                </mat-form-field>
            </div>

            <div mat-dialog-actions>
                <button mat-button type="button" (click)="onCancel()">Cancel</button>
                <button mat-raised-button color="primary" type="submit"
                    [disabled]="transactionForm.invalid">
                    {{ data.transaction ? 'Update' : 'Add' }}
                </button>
            </div>
        </form>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
            max-width: 500px;
        }

        mat-form-field {
            width: 100%;
            margin-bottom: 16px;
        }

        textarea {
            min-height: 100px;
        }

        .mat-dialog-actions {
            justify-content: flex-end;
            gap: 8px;
        }
    `]
})
export class TransactionDialogComponent {
    transactionForm: FormGroup;
    tags: string[] = [];
    separatorKeysCodes = [13, 188]; // Enter and comma keys

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<TransactionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.transactionForm = this.fb.group({
            type: [data.transaction?.type || 'expense', Validators.required],
            amount: [data.transaction?.amount || '', [Validators.required, Validators.min(0)]],
            date: [data.transaction?.date || new Date(), Validators.required],
            categoryId: [data.transaction?.categoryId || '', Validators.required],
            notes: [data.transaction?.notes || ''],
            recurringType: [data.transaction?.recurringType || 'none']
        });

        if (data.transaction?.tags) {
            this.tags = [...data.transaction.tags];
        }
    }

    get filteredCategories(): Category[] {
        const type = this.transactionForm.get('type')?.value;
        return this.data.categories.filter(category => category.type === type);
    }

    addTag(event: any): void {
        const input = event.input;
        const value = event.value.trim();

        if (value) {
            this.tags.push(value);
        }

        if (input) {
            input.value = '';
        }
    }

    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    onSubmit(): void {
        if (this.transactionForm.valid) {
            const formData = new FormData();
            const formValue = this.transactionForm.value;

            Object.keys(formValue).forEach(key => {
                if (formValue[key] !== null && formValue[key] !== undefined) {
                    if (key === 'date') {
                        formData.append(key, formValue[key].toISOString());
                    } else {
                        formData.append(key, formValue[key]);
                    }
                }
            });

            if (this.tags.length > 0) {
                formData.append('tags', JSON.stringify(this.tags));
            }

            this.dialogRef.close(formData);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}