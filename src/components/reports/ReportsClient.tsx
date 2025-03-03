'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { TransactionType, TransactionStatus } from '@/lib/types';

interface ReportsClientProps {
  accounts: Array<{ _id: string; name: string; type: string }>;
  categories: Array<{ _id: string; name: string }>;
  payees: Array<{ _id: string; name: string }>;
}

interface FilterFormData {
  startDate: string;
  endDate: string;
  type: TransactionType | '';
  status: TransactionStatus | '';
  accountId: string[];
  categoryId: string[];
  payeeId: string[];
}

interface Category {
  _id: string;
  name: string;
}

interface Payee {
  _id: string;
  name: string;
}

interface Transaction {
  _id: string;
  date: string;
  type: string;
  amount: number;
  accountId: { name: string };
  categoryId?: Category[];
  payeeId?: Payee[];
  status: string;
  notes?: string;
}

export default function ReportsClient({
  accounts,
  categories,
  payees,
}: ReportsClientProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FilterFormData>({
    defaultValues: {
      startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      type: '',
      status: '',
      accountId: [],
      categoryId: [],
      payeeId: [],
    },
  });
  
  const onSubmit = async (data: FilterFormData) => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (data.startDate) params.append('startDate', data.startDate);
      if (data.endDate) params.append('endDate', data.endDate);
      if (data.type) params.append('type', data.type);
      if (data.status) params.append('status', data.status);
      if (data.accountId.length) {
        data.accountId.forEach(id => params.append('accountId', id));
      }
      if (data.categoryId.length) {
        data.categoryId.forEach(id => params.append('categoryId', id));
      }
      if (data.payeeId.length) {
        data.payeeId.forEach(id => params.append('payeeId', id));
      }
      
      const response = await fetch(`/api/reports/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const result = await response.json();
      setTransactions(result.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportCSV = () => {
    if (!transactions.length) return;
    
    // Define CSV headers
    const headers = [
      'Date',
      'Type',
      'Amount',
      'Account',
      'Category',
      'Payee',
      'Status',
      'Notes',
    ];
    
    // Transform transactions data
    const csvData = transactions.map((t: Transaction) => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.amount.toFixed(2),
      t.accountId.name,
      t.categoryId?.map((c: Category) => c.name).join(', ') || '',
      t.payeeId?.map((p: Payee) => p.name).join(', ') || '',
      t.status,
      t.notes || '',
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate custom reports and export transaction data
        </p>
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                {...register('startDate')}
                className="mt-1 h-10 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                {...register('endDate')}
                className="mt-1 h-10 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                {...register('type')}
                className="mt-1 h-10 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
                <option value={TransactionType.DEPOSIT}>Deposit</option>
                <option value={TransactionType.TRANSFER}>Transfer</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="mt-1 h-10 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value={TransactionStatus.RECONCILED}>Reconciled</option>
                <option value={TransactionStatus.UNRECONCILED}>Unreconciled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                Accounts
              </label>
              <select
                id="accountId"
                multiple
                {...register('accountId')}
                className="mt-1 h-32 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              <select
                id="categoryId"
                multiple
                {...register('categoryId')}
                className="mt-1 h-32 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>
            
            <div>
              <label htmlFor="payeeId" className="block text-sm font-medium text-gray-700">
                Payees
              </label>
              <select
                id="payeeId"
                multiple
                {...register('payeeId')}
                className="mt-1 h-32 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              >
                {payees.map((payee) => (
                  <option key={payee._id} value={payee._id}>
                    {payee.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!transactions.length || isLoading}
              className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Export CSV
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Table */}
      {transactions.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Account</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Payee</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {format(new Date(transaction.date), 'yyyy-MM-dd')}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.type}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.accountId.name}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.categoryId?.map((c: Category) => c.name).join(', ') || '-'}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.payeeId?.map((p: Payee) => p.name).join(', ') || '-'}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.status}
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900">
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 