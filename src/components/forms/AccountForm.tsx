'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/types';

// Validation schema
const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(60),
  type: z.enum(['savings', 'checking', 'credit', 'demat', 'cash', 'investment', 'loan', 'other']),
  balance: z.number().or(z.string().transform(val => Number(val))),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().or(z.string().transform(val => Number(val))).optional(),
  description: z.string().max(1000).optional(),
  startDate: z.string(),
  closedDate: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: {
    _id: string;
    name: string;
    type: 'savings' | 'checking' | 'credit' | 'demat' | 'cash' | 'investment' | 'loan' | 'other';
    balance: number;
    currency?: string;
    creditLimit?: number;
    description?: string;
    startDate: string;
    closedDate?: string;
    isActive: boolean;
    notes?: string;
  };
  onSuccess?: () => void;
}

export default function AccountForm({ account, onSuccess }: AccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userDefaultCurrency, setUserDefaultCurrency] = useState(DEFAULT_CURRENCY);
  const router = useRouter();
  const { data: session } = useSession();
  
  const isEditMode = !!account;
  
  // Fetch user's default currency
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const userData = await response.json();
            if (userData.defaultCurrency) {
              setUserDefaultCurrency(userData.defaultCurrency);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };
    
    fetchUserData();
  }, [session]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          ...account,
          currency: account.currency || userDefaultCurrency,
          startDate: format(new Date(account.startDate), 'yyyy-MM-dd'),
          closedDate: account.closedDate ? format(new Date(account.closedDate), 'yyyy-MM-dd') : undefined,
        }
      : {
          name: '',
          type: 'savings',
          balance: 0,
          currency: userDefaultCurrency,
          creditLimit: 0,
          description: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          isActive: true,
          notes: '',
        },
  });
  
  // Update form when userDefaultCurrency changes
  useEffect(() => {
    if (!isEditMode) {
      setValue('currency', userDefaultCurrency);
    }
  }, [userDefaultCurrency, isEditMode, setValue]);
  
  const accountType = watch('type');
  const isActive = watch('isActive');
  
  const onSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = isEditMode
        ? `/api/accounts/${account._id}`
        : '/api/accounts';
      
      const method = isEditMode ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Failed to save account');
        return;
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/accounts');
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Account Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Account Type *
          </label>
          <select
            id="type"
            {...register('type')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          >
            <option value="savings">Savings</option>
            <option value="checking">Checking</option>
            <option value="credit">Credit Card</option>
            <option value="demat">Demat</option>
            <option value="cash">Cash</option>
            <option value="investment">Investment</option>
            <option value="loan">Loan</option>
            <option value="other">Other</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
            Balance *
          </label>
          <input
            id="balance"
            type="number"
            step="0.01"
            {...register('balance')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.balance && (
            <p className="mt-1 text-sm text-red-600">{errors.balance.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency *
          </label>
          <select
            id="currency"
            {...register('currency')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>
        
        {(accountType === 'credit' || accountType === 'loan') && (
          <div>
            <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">
              Credit Limit
            </label>
            <input
              id="creditLimit"
              type="number"
              step="0.01"
              {...register('creditLimit')}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
            {errors.creditLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.creditLimit.message}</p>
            )}
          </div>
        )}
        
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
              Account Status
            </label>
          </div>
          <div className="mt-1 flex items-center">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
        </div>
        
        {!isActive && (
          <div>
            <label htmlFor="closedDate" className="block text-sm font-medium text-gray-700">
              Closed Date
            </label>
            <input
              id="closedDate"
              type="date"
              {...register('closedDate')}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
            {errors.closedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.closedDate.message}</p>
            )}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-3 rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
        >
          {isLoading ? 'Saving...' : isEditMode ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
} 