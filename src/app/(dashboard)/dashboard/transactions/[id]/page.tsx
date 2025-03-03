import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PencilIcon, ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Transaction, User } from '@/lib/models';
import { TransactionType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export const metadata: Metadata = {
  title: 'Transaction Details | Finance Tracker',
  description: 'View and manage your transaction details',
};

export default async function TransactionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();
  await dbConnect();
  
  // Get user data including default currency
  const userData = await User.findById(user.id);
  const defaultCurrency = userData?.defaultCurrency || 'INR';
  
  // Get transaction
  const transaction = await Transaction.findOne({
    _id: params.id,
    userId: user.id,
  })
    .populate('accountId')
    .populate('categoryId')
    .populate('payeeId')
    .populate('toAccountId');
  
  if (!transaction) {
    notFound();
  }
  
  const isTransfer = transaction.type === TransactionType.TRANSFER;
  const isDeposit = transaction.type === TransactionType.DEPOSIT;
  const accountCurrency = transaction.accountId?.currency || defaultCurrency;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/dashboard/transactions"
            className="mr-4 rounded-md bg-white p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Back to transactions</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isTransfer ? 'Transfer' : isDeposit ? 'Deposit' : 'Withdrawal'}
            </h1>
            <p className="text-sm text-gray-500">
              {format(new Date(transaction.date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/transactions/${transaction._id}/edit`}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Edit
          </Link>
          <form action={`/api/transactions/${transaction._id}`} method="DELETE">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-100"
              onClick={(e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
                  fetch(`/api/transactions/${transaction._id}`, {
                    method: 'DELETE',
                  }).then((response) => {
                    if (response.ok) {
                      window.location.href = '/dashboard/transactions';
                    }
                  });
                }
              }}
            >
              <TrashIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Delete
            </button>
          </form>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
              <div className={`text-lg font-semibold ${isDeposit ? 'text-green-600' : isTransfer ? 'text-blue-600' : 'text-red-600'}`}>
                {isDeposit ? '+' : isTransfer ? '' : '-'}
                {formatCurrency(transaction.amount, accountCurrency)}
              </div>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {isTransfer ? 'Transfer' : isDeposit ? 'Deposit' : 'Withdrawal'}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {format(new Date(transaction.date), 'MMMM d, yyyy')}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {formatCurrency(transaction.amount, accountCurrency)}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Account</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    <Link 
                      href={`/dashboard/accounts/${transaction.accountId._id}`}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      {transaction.accountId.name}
                    </Link>
                  </dd>
                </div>
                
                {isTransfer && transaction.toAccountId && (
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">To Account</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <Link 
                        href={`/dashboard/accounts/${transaction.toAccountId._id}`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        {transaction.toAccountId.name}
                      </Link>
                    </dd>
                  </div>
                )}
                
                {transaction.payeeId && (
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Payee</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {transaction.payeeId.name}
                    </dd>
                  </div>
                )}
                
                {transaction.categoryId && (
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {transaction.categoryId.name}
                    </dd>
                  </div>
                )}
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </dd>
                </div>
                
                {transaction.notes && (
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-line">
                      {transaction.notes}
                    </dd>
                  </div>
                )}
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {format(new Date(transaction.createdAt), 'MMMM d, yyyy')}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {format(new Date(transaction.updatedAt), 'MMMM d, yyyy')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 