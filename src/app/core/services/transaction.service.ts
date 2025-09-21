import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
    _id: string;
    type: 'income' | 'expense';
    amount: number;
    date: Date;
    categoryId: string | {
        _id: string;
        name: string;
        icon: string;
        color: string;
    };
    userId: string;
    notes?: string;
    attachment?: {
        filename: string;
        path: string;
        mimetype: string;
    };
    tags?: string[];
    recurringType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    status: 'completed' | 'pending' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionFilters {
    startDate?: Date;
    endDate?: Date;
    type?: 'income' | 'expense';
    categoryId?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface TransactionResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface TransactionStats {
    summary: {
        income: number;
        expense: number;
        balance: number;
    };
    categoryBreakdown: {
        type: 'income' | 'expense';
        category: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        total: number;
        count: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient) {}

    getTransactions(filters: TransactionFilters = {}): Observable<TransactionResponse> {
        let params = new HttpParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (value instanceof Date) {
                    params = params.set(key, value.toISOString());
                } else {
                    params = params.set(key, value.toString());
                }
            }
        });

        return this.http.get<TransactionResponse>(this.apiUrl, { params });
    }

    getTransactionById(id: string): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
    }

    createTransaction(data: FormData): Observable<Transaction> {
        return this.http.post<Transaction>(this.apiUrl, data);
    }

    updateTransaction(id: string, data: FormData): Observable<Transaction> {
        return this.http.put<Transaction>(`${this.apiUrl}/${id}`, data);
    }

    deleteTransaction(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getStats(startDate?: Date, endDate?: Date): Observable<TransactionStats> {
        let params = new HttpParams();
        
        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }

        return this.http.get<TransactionStats>(`${this.apiUrl}/stats`, { params });
    }
}