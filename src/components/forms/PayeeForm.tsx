'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface PayeeFormData {
  name: string;
  description?: string;
}

interface PayeeFormProps {
  payeeId?: string;
  initialData?: {
    name: string;
    description?: string;
  };
  onSuccess?: () => void;
}

export default function PayeeForm({ payeeId, initialData, onSuccess }: PayeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PayeeFormData>({
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  });
  
  const onSubmit = async (data: PayeeFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(payeeId ? `/api/payees/${payeeId}` : '/api/payees', {
        method: payeeId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save payee');
      }
      
      toast.success(payeeId ? 'Payee updated successfully' : 'Payee created successfully');
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving payee:', error);
      toast.error('Failed to save payee');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!payeeId) return;
    
    if (!confirm('Are you sure you want to delete this payee? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/payees/${payeeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete payee');
      }
      
      toast.success('Payee deleted successfully');
      router.push('/dashboard/payees');
      router.refresh();
    } catch (error) {
      console.error('Error deleting payee:', error);
      toast.error('Failed to delete payee');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        {payeeId && (
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
          className="h-10 w-full flex items-center justify-center rounded-md border border-transparent bg-violet-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : payeeId ? 'Update Payee' : 'Create Payee'}
        </button>
      </div>
    </form>
  );
} 