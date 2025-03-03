'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface AccountFormData {
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
  creditLimit?: number;
  startDate: string;
  closedDate?: string;
  isActive: boolean;
  notes?: string;
}

interface AccountFormProps {
  accountId?: string;
  initialData?: AccountFormData;
  onSuccess?: () => void;
}

const accountTypes = [
  { id: 'SAVINGS', name: 'Savings' },
  { id: 'CHECKING', name: 'Checking' },
  { id: 'CREDIT_CARD', name: 'Credit Card' },
  { id: 'CASH', name: 'Cash' },
  { id: 'INVESTMENT', name: 'Investment' },
  { id: 'LOAN', name: 'Loan' },
];

const currencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
];

const inputClassName = "h-10 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm";
const textareaClassName = "px-3 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm";

export default function AccountForm({ accountId, initialData, onSuccess }: AccountFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<AccountFormData>({
    defaultValues: initialData || {
      name: '',
      type: 'SAVINGS',
      balance: 0,
      currency: 'INR',
      description: '',
      creditLimit: 0,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
      notes: '',
    },
  });

  const accountType = useWatch({ control, name: 'type' });
  const isActive = useWatch({ control, name: 'isActive' });
  
  const onSubmit = async (data: AccountFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(accountId ? `/api/accounts/${accountId}` : '/api/accounts', {
        method: accountId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save account');
      }
      
      toast.success(accountId ? 'Account updated successfully' : 'Account created successfully');
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!accountId) return;
    
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      toast.success('Account deleted successfully');
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Account Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Account name is required' })}
            className={inputClassName}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Account Type
        </label>
        <div className="mt-1">
          <select
            id="type"
            {...register('type', { required: 'Account type is required' })}
            className={inputClassName}
          >
            {accountTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
          Initial Balance
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="balance"
            step="0.01"
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
            {...register('balance', {
              required: 'Balance is required',
              valueAsNumber: true,
            })}
            className={inputClassName}
          />
          {errors.balance && (
            <p className="mt-1 text-sm text-red-600">{errors.balance.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Currency
        </label>
        <div className="mt-1">
          <select
            id="currency"
            {...register('currency', { required: 'Currency is required' })}
            className={inputClassName}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>
      </div>

      {(accountType === 'CREDIT_CARD' || accountType === 'LOAN') && (
        <div>
          <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">
            Credit Limit
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="creditLimit"
              step="0.01"
              {...register('creditLimit', {
                valueAsNumber: true,
              })}
              className={inputClassName}
            />
            {errors.creditLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.creditLimit.message}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <div className="mt-1">
          <input
            type="date"
            id="startDate"
            {...register('startDate', { required: 'Start date is required' })}
            className={inputClassName}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center h-10">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Account is active
          </label>
        </div>
      </div>

      {!isActive && (
        <div>
          <label htmlFor="closedDate" className="block text-sm font-medium text-gray-700">
            Closed Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              id="closedDate"
              {...register('closedDate')}
              className={inputClassName}
            />
            {errors.closedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.closedDate.message}</p>
            )}
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className={textareaClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="notes"
            {...register('notes')}
            className={inputClassName}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        {accountId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="h-10 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full flex items-center justify-center rounded-md border border-transparent bg-violet-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : accountId ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
} 