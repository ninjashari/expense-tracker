import { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Transaction, Account, User, Category, Payee } from '@/lib/models';
import { TransactionType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export const metadata: Metadata = {
  title: 'Transactions | Finance Tracker',
  description: 'Manage your financial transactions',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await requireAuth();
  await dbConnect();
  
  // Get user data including default currency
  const userData = await User.findById(user.id);
  const defaultCurrency = userData?.defaultCurrency || 'INR';
  
  // Parse query parameters
  const accountId = typeof searchParams.accountId === 'string' ? searchParams.accountId : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  
  // Build query
  const query: any = { userId: user.id };
  
  if (accountId) {
    query.$or = [
      { accountId },
      { toAccountId: accountId }
    ];
  }
  
  // Get total count for pagination
  const total = await Transaction.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  
  // Get transactions
  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate('accountId')
    .populate('categoryId')
    .populate('payeeId')
    .populate('toAccountId');
  
  // Get accounts for filter
  const accounts = await Account.find({ userId: user.id }).sort({ name: 1 });
  
  // Get categories and payees for display
  const categories = await Category.find({ userId: user.id }).sort({ name: 1 });
  const payees = await Payee.find({ userId: user.id }).sort({ name: 1 });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Transaction
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="account-filter" className="block text-sm font-medium text-gray-700">
              Account
            </label>
            <select
              id="account-filter"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              defaultValue={accountId || ''}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.value) {
                  url.searchParams.set('accountId', e.target.value);
                } else {
                  url.searchParams.delete('accountId');
                }
                url.searchParams.delete('page');
                window.location.href = url.toString();
              }}
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account._id.toString()} value={account._id.toString()}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      {transactions.length > 0 ? (
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
                  <Link 
                    href={`/dashboard/transactions/${transaction._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {transaction.payeeId?.name || 
                                  (transaction.type === TransactionType.TRANSFER ? 'Transfer' : 'Uncategorized')}
                              </p>
                              <div className="mt-1 flex text-sm text-gray-500">
                                <p className="truncate">
                                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                                </p>
                                <span className="mx-1">•</span>
                                <p className="truncate">
                                  {transaction.accountId?.name}
                                  {transaction.type === TransactionType.TRANSFER && transaction.toAccountId && (
                                    <> → {transaction.toAccountId.name}</>
                                  )}
                                </p>
                                {transaction.categoryId && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <p className="truncate">{transaction.categoryId.name}</p>
                                  </>
                                )}
                              </div>
                            </div>
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
                  </Link>
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
                  Showing <span className="font-medium">{skip + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(skip + limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                {page > 1 && (
                  <Link
                    href={{
                      pathname: '/dashboard/transactions',
                      query: {
                        ...(accountId ? { accountId } : {}),
                        page: page - 1,
                      },
                    }}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={{
                      pathname: '/dashboard/transactions',
                      query: {
                        ...(accountId ? { accountId } : {}),
                        page: page + 1,
                      },
                    }}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No transactions found. Create your first transaction to get started.</p>
        </div>
      )}
    </div>
  );
} 