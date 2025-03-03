'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import TransactionModal from '@/components/transactions/TransactionModal';
import AccountFilter from '@/components/transactions/AccountFilter';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { TransactionType } from '@/lib/types';

interface TransactionsClientProps {
  accounts: Array<{ _id: string; name: string; type: string }>;
  categories: Array<{ _id: string; name: string }>;
  payees: Array<{ _id: string; name: string }>;
  transactions: Array<any>;
  defaultCurrency: string;
  accountId?: string;
  total: number;
  page: number;
  totalPages: number;
}

export default function TransactionsClient({
  accounts,
  categories,
  payees,
  transactions,
  defaultCurrency,
  accountId,
  total,
  page,
  totalPages,
}: TransactionsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add Transaction
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <AccountFilter 
            accounts={accounts.map(account => ({
              _id: account._id.toString(),
              name: account.name
            }))}
            selectedAccountId={accountId}
          />
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction) => {
            const isIncoming = 
              transaction.type === TransactionType.DEPOSIT || 
              (transaction.type === TransactionType.TRANSFER && 
               accountId && transaction.toAccountId?._id.toString() === accountId);
            
            const account = isIncoming && transaction.type === TransactionType.TRANSFER
              ? transaction.toAccountId
              : transaction.accountId;
            
            const currency = account?.currency || defaultCurrency;
            
            return (
              <li key={transaction._id.toString()}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.payeeId ? transaction.payeeId.name : 'Transfer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account?.name} • {transaction.categoryId?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className={`ml-5 text-sm font-medium ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncoming ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount), currency)}
                    </div>
                  </div>
                  {transaction.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-1">{transaction.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              {page > 1 && (
                <button
                  onClick={() => router.push(`/dashboard/transactions?page=${page - 1}${accountId ? `&accountId=${accountId}` : ''}`)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {page < totalPages && (
                <button
                  onClick={() => router.push(`/dashboard/transactions?page=${page + 1}${accountId ? `&accountId=${accountId}` : ''}`)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </nav>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.refresh();
        }}
        accounts={accounts}
        categories={categories}
        payees={payees}
      />
    </div>
  );
} 