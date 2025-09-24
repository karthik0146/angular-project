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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Transaction } from '../../../core/services/transaction.service';
import { Category } from '../../../core/services/category.service';
import { AIService } from '../../../core/services/ai.service';

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
        MatIconModule,
        MatProgressSpinnerModule
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
                    <mat-label>Description</mat-label>
                    <input matInput formControlName="notes" placeholder="e.g., Starbucks coffee">
                </mat-form-field>

                <!-- AI Categorization Button -->
                <div class="ai-categorization" *ngIf="transactionForm.get('notes')?.value">
                    <button mat-stroked-button color="accent" type="button" 
                            (click)="suggestCategory()" 
                            [disabled]="isLoadingAI">
                        <mat-icon>psychology</mat-icon>
                        <span *ngIf="!isLoadingAI">AI Suggest Category</span>
                        <span *ngIf="isLoadingAI">
                            <mat-spinner diameter="16" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                            Analyzing...
                        </span>
                    </button>
                    <div *ngIf="aiSuggestion" class="ai-suggestion">
                        <mat-icon color="accent">lightbulb</mat-icon>
                        <span>AI suggests: <strong>{{aiSuggestion.category}}</strong> ({{aiSuggestion.confidence}}% confidence)</span>
                        <button mat-button color="primary" (click)="applyAISuggestion()">Apply</button>
                    </div>
                </div>

                <mat-form-field appearance="outline">
                    <mat-label>Category</mat-label>
                    <mat-select formControlName="categoryId">
                        <mat-option *ngFor="let category of filteredCategories" [value]="category._id">
                            {{ category.name }}
                        </mat-option>
                    </mat-select>
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

        .ai-categorization {
            margin: 16px 0;
            
            button {
                margin-bottom: 8px;
            }
        }

        .ai-suggestion {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: #f3e5f5;
            border-radius: 8px;
            margin-top: 8px;
            
            mat-icon {
                color: #7b1fa2;
            }
            
            strong {
                color: #7b1fa2;
            }
        }
    `]
})
export class TransactionDialogComponent {
    transactionForm: FormGroup;
    tags: string[] = [];
    separatorKeysCodes = [13, 188]; // Enter and comma keys
    isLoadingAI = false;
    aiSuggestion: { category: string; confidence: number; categoryId?: string } | null = null;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<TransactionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private aiService: AIService
    ) {
        const transaction = data.transaction;
        
        this.transactionForm = this.fb.group({
            type: [transaction?.type || 'expense', Validators.required],
            amount: [transaction?.amount || '', [Validators.required, Validators.min(0)]],
            date: [transaction?.date ? new Date(transaction.date) : new Date(), Validators.required],
            categoryId: [transaction?.categoryId || '', Validators.required],
            notes: [transaction?.notes || ''],
            recurringType: [transaction?.recurringType || 'none']
        });

        if (transaction?.tags) {
            this.tags = Array.isArray(transaction.tags) ? [...transaction.tags] : [];
        }
   }

    get filteredCategories(): Category[] {
        const type = this.transactionForm.get('type')?.value;
        const filtered = this.data.categories.filter(category => category.type === type);
        return filtered;
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

    async suggestCategory(): Promise<void> {
        const description = this.transactionForm.get('notes')?.value;
        const amount = this.transactionForm.get('amount')?.value;
        
        if (!description) return;

        this.isLoadingAI = true;
        this.aiSuggestion = null;

        try {
            const suggestion = await this.aiService.categorizeTransaction(description, amount).toPromise();
            
            if (suggestion) {
                // Find matching category from available categories
                const matchingCategory = this.filteredCategories.find(cat => 
                    cat.name.toLowerCase().includes(suggestion.suggestedCategory.toLowerCase()) ||
                    suggestion.suggestedCategory.toLowerCase().includes(cat.name.toLowerCase())
                );

                this.aiSuggestion = {
                    category: suggestion.suggestedCategory,
                    confidence: suggestion.confidence,
                    categoryId: matchingCategory?._id
                };
            }
        } catch (error) {
            console.error('AI categorization failed:', error);
            // Show fallback message
            this.aiSuggestion = {
                category: 'Unable to categorize',
                confidence: 0
            };
        } finally {
            this.isLoadingAI = false;
        }
    }

    applyAISuggestion(): void {
        if (this.aiSuggestion?.categoryId) {
            this.transactionForm.patchValue({
                categoryId: this.aiSuggestion.categoryId
            });
        }
        this.aiSuggestion = null;
    }

    onSubmit(): void {
        if (this.transactionForm.valid) {
            const formValue = this.transactionForm.value;            
            // Check if categoryId is valid
            if (!formValue.categoryId || formValue.categoryId.trim() === '') {
                console.error('Category ID is empty or invalid');
                this.transactionForm.get('categoryId')?.setErrors({ required: true });
                return;
            }
            
            const formData = new FormData();

            // Add form fields to FormData
            formData.append('type', formValue.type);
            formData.append('amount', formValue.amount.toString());
            formData.append('date', formValue.date.toISOString());
            formData.append('categoryId', formValue.categoryId.toString());
            formData.append('notes', formValue.notes || '');
            formData.append('recurringType', formValue.recurringType || 'none');
            
            // Handle tags
            if (this.tags.length > 0) {
                formData.append('tags', JSON.stringify(this.tags));
            } else {
                formData.append('tags', JSON.stringify([]));
            }

        

            this.dialogRef.close(formData);
        } else {
            Object.keys(this.transactionForm.controls).forEach(key => {
                const control = this.transactionForm.get(key);
                control?.markAsTouched();
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}