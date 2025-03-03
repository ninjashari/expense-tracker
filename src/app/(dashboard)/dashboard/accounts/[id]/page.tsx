import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account, Transaction } from '@/lib/models';
import { TransactionType } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Account Details | Finance Tracker',
  description: 'View and manage your account details',
};

export default async function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();
  await dbConnect();
  
  // Get account
  const account = await Account.findOne({
    _id: params.id,
    userId: user.id,
  });
  
  if (!account) {
    notFound();
  }
  
  // Get recent transactions for this account
  const recentTransactions = await Transaction.find({
    userId: user.id,
    $or: [
      { accountId: account._id },
      { toAccountId: account._id },
    ],
  })
    .sort({ date: -1 })
    .limit(10)
    .populate('categoryId')
    .populate('payeeId');
  
  // Calculate income and expenses for this account
  const income = recentTransactions
    .filter(t => t.type === TransactionType.DEPOSIT || 
      (t.type === TransactionType.TRANSFER && t.toAccountId?.toString() === account._id.toString()))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = recentTransactions
    .filter(t => t.type === TransactionType.WITHDRAWAL || 
      (t.type === TransactionType.TRANSFER && t.accountId.toString() === account._id.toString() && 
       t.toAccountId?.toString() !== account._id.toString()))
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/dashboard/accounts"
            className="mr-4 rounded-md bg-white p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Back to accounts</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-sm text-gray-500">
              {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account
              {!account.isActive && <span className="ml-2 text-red-600">• Closed</span>}
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/accounts/${account._id}/edit`}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          Edit
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Details</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Balance</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">${account.balance.toFixed(2)}</dd>
            </div>
            
            {(account.type === 'credit' || account.type === 'loan') && account.creditLimit > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">${account.creditLimit.toFixed(2)}</dd>
              </div>
            )}
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(account.startDate), 'MMMM d, yyyy')}
              </dd>
            </div>
            
            {account.closedDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Closed Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(account.closedDate), 'MMMM d, yyyy')}
                </dd>
              </div>
            )}
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {account.description || 'No description provided'}
              </dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {account.notes || 'No notes provided'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(account.createdAt), 'MMMM d, yyyy')}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(account.updatedAt), 'MMMM d, yyyy')}
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Activity</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div className="bg-green-50 rounded-md p-4">
              <p className="text-sm text-green-700">Income</p>
              <p className="text-xl font-semibold text-green-900">+${income.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 rounded-md p-4">
              <p className="text-sm text-red-700">Expenses</p>
              <p className="text-xl font-semibold text-red-900">-${expenses.toFixed(2)}</p>
            </div>
          </div>
          
          <h3 className="text-md font-medium text-gray-900 mb-2">Recent Transactions</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const isIncoming = transaction.type === TransactionType.DEPOSIT || 
                  (transaction.type === TransactionType.TRANSFER && 
                   transaction.toAccountId?.toString() === account._id.toString());
                
                return (
                  <div key={transaction._id.toString()} className="border-b pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.payeeId ? transaction.payeeId.name : 'Transfer'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')} • 
                          {transaction.categoryId?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <div className={`text-${isIncoming ? 'green' : 'red'}-600 font-medium`}>
                        {isIncoming ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No recent transactions for this account</p>
          )}
          
          <div className="mt-4">
            <Link
              href={`/dashboard/transactions/new?accountId=${account._id}`}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Add transaction
            </Link>
            {' • '}
            <Link
              href={`/dashboard/transactions?accountId=${account._id}`}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 