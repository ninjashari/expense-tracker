'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { TransactionType, TransactionStatus } from '@/lib/types';

// Validation schema for transactions
const transactionSchema = z.object({
  date: z.string(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum([
    TransactionType.DEPOSIT, 
    TransactionType.WITHDRAWAL, 
    TransactionType.TRANSFER
  ]),
  status: z.enum([
    TransactionStatus.RECONCILED, 
    TransactionStatus.UNRECONCILED
  ]),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional(),
  payeeId: z.string().optional(),
  notes: z.string().max(500).optional(),
  toAccountId: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: {
    _id: string;
    date: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    accountId: { _id: string; name: string };
    categoryId?: { _id: string; name: string };
    payeeId?: { _id: string; name: string };
    notes?: string;
    toAccountId?: { _id: string; name: string };
  };
  accounts: Array<{ _id: string; name: string; type: string }>;
  categories: Array<{ _id: string; name: string }>;
  payees: Array<{ _id: string; name: string }>;
  onSuccess?: () => void;
}

export default function TransactionForm({ 
  transaction, 
  accounts,
  categories,
  payees,
  onSuccess 
}: TransactionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const isEditMode = !!transaction;
  const defaultType = transaction?.type || TransactionType.WITHDRAWAL;
  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: transaction ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      amount: transaction ? transaction.amount : undefined,
      type: transaction ? transaction.type : TransactionType.WITHDRAWAL,
      status: transaction ? transaction.status : TransactionStatus.UNRECONCILED,
      accountId: transaction?.accountId?._id || '',
      categoryId: transaction?.categoryId?._id || '',
      payeeId: transaction?.payeeId?._id || '',
      notes: transaction?.notes || '',
      toAccountId: transaction?.toAccountId?._id || '',
    },
  });
  
  // Watch for type changes
  const typeValue = watch('type');
  
  useEffect(() => {
    setTransactionType(typeValue as TransactionType);
  }, [typeValue]);
  
  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate transfer transaction
      if (data.type === TransactionType.TRANSFER && !data.toAccountId) {
        setError('To Account is required for transfer transactions');
        setIsLoading(false);
        return;
      }
      
      // Prepare request
      const url = isEditMode 
        ? `/api/transactions/${transaction._id}` 
        : '/api/transactions';
      
      const method = isEditMode ? 'PATCH' : 'POST';
      
      // Send request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      
      // Handle success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard/transactions/${result.data.transaction._id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Transaction Type *
          </label>
          <select
            id="type"
            {...register('type')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          >
            <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
            <option value={TransactionType.DEPOSIT}>Deposit</option>
            <option value={TransactionType.TRANSFER}>Transfer</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            id="date"
            type="date"
            {...register('date')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            onKeyDown={(e) => {
              // Allow only numbers, backspace, delete, tab, enter, decimal point, and arrow keys
              if (
                !/[\d\.]/.test(e.key) && 
                !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)
              ) {
                e.preventDefault();
              }
              // Prevent multiple decimal points
              if (e.key === '.' && (e.target as HTMLInputElement).value.includes('.')) {
                e.preventDefault();
              }
            }}
            {...register('amount')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
            {transactionType === TransactionType.TRANSFER ? 'From Account *' : 'Account *'}
          </label>
          <select
            id="accountId"
            {...register('accountId')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="mt-1 text-sm text-red-600">{errors.accountId.message}</p>
          )}
        </div>
        
        {transactionType === TransactionType.TRANSFER && (
          <div>
            <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700">
              To Account *
            </label>
            <select
              id="toAccountId"
              {...register('toAccountId')}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name} ({account.type})
                </option>
              ))}
            </select>
            {errors.toAccountId && (
              <p className="mt-1 text-sm text-red-600">{errors.toAccountId.message}</p>
            )}
          </div>
        )}
        
        {transactionType !== TransactionType.TRANSFER && (
          <div>
            <label htmlFor="payeeId" className="block text-sm font-medium text-gray-700">
              Payee
            </label>
            <select
              id="payeeId"
              {...register('payeeId')}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            >
              <option value="">Select a payee</option>
              {payees.map((payee) => (
                <option key={payee._id} value={payee._id}>
                  {payee.name}
                </option>
              ))}
            </select>
            {errors.payeeId && (
              <p className="mt-1 text-sm text-red-600">{errors.payeeId.message}</p>
            )}
          </div>
        )}
        
        {transactionType !== TransactionType.TRANSFER && (
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="categoryId"
              {...register('categoryId')}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>
        )}
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          >
            <option value={TransactionStatus.UNRECONCILED}>Unreconciled</option>
            <option value={TransactionStatus.RECONCILED}>Reconciled</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full flex items-center justify-center rounded-md border border-transparent bg-violet-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Create Transaction'}
        </button>
      </div>
    </form>
  );
} 