import { Types } from 'mongoose';

// Supported currencies
export const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' },
  { code: 'CNY', name: 'Chinese Yuan (¥)' },
  { code: 'AED', name: 'UAE Dirham (د.إ)' },
];

// Default currency
export const DEFAULT_CURRENCY = 'INR';

// Base type with timestamps
export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User model
export interface User extends BaseDocument {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  defaultCurrency: string; // Default currency for the user
}

// Account model
export interface Account extends BaseDocument {
  name: string;
  type: string;
  balance: number;
  currency: string; // Currency for this account
  creditLimit?: number;
  description?: string;
  startDate: Date;
  closedDate?: Date;
  isActive: boolean;
  notes?: string;
  userId: Types.ObjectId;
}

// Category model
export interface Category extends BaseDocument {
  name: string;
  description?: string;
  userId: Types.ObjectId;
}

// Payee model
export interface Payee extends BaseDocument {
  name: string;
  description?: string;
  userId: Types.ObjectId;
}

// Transaction types
export enum TransactionType {
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
}

// Transaction status
export enum TransactionStatus {
  RECONCILED = 'reconciled',
  UNRECONCILED = 'unreconciled',
}

// Transaction model
export interface Transaction extends BaseDocument {
  date: Date;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  accountId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  payeeId?: Types.ObjectId;
  notes?: string;
  userId: Types.ObjectId;
  // For transfer transactions
  toAccountId?: Types.ObjectId;
} 