import { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/outline';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';
import { Account as AccountType } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Accounts | Finance Tracker',
  description: 'Manage your financial accounts',
};

export default async function AccountsPage() {
  const user = await requireAuth();
  await dbConnect();
  
  // Get accounts
  const accounts = await Account.find({ userId: user.id }).sort({ name: 1 });
  
  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Group accounts by type
  const accountsByType = accounts.reduce<Record<string, typeof accounts>>((acc, account) => {
    const type = account.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(account);
    return acc;
  }, {});
  
  // Account type labels
  const typeLabels: Record<string, string> = {
    savings: 'Savings Accounts',
    checking: 'Checking Accounts',
    credit: 'Credit Cards',
    demat: 'Demat Accounts',
    cash: 'Cash Accounts',
    investment: 'Investment Accounts',
    loan: 'Loans',
    other: 'Other Accounts',
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <Link
          href="/dashboard/accounts/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Account
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-2xl font-semibold text-gray-900">${totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-500">Total Accounts</p>
            <p className="text-2xl font-semibold text-gray-900">{accounts.length}</p>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-500">Active Accounts</p>
            <p className="text-2xl font-semibold text-gray-900">
              {accounts.filter(a => a.isActive).length}
            </p>
          </div>
        </div>
      </div>
      
      {Object.keys(accountsByType).length > 0 ? (
        Object.keys(accountsByType).map((type) => (
          <div key={type} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{typeLabels[type]}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {accountsByType[type].map((account) => (
                <Link
                  key={account._id.toString()}
                  href={`/dashboard/accounts/${account._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {account.name}
                          {!account.isActive && (
                            <span className="ml-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                              Closed
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Started: {format(new Date(account.startDate), 'MMM d, yyyy')}
                          {account.closedDate && (
                            <> • Closed: {format(new Date(account.closedDate), 'MMM d, yyyy')}</>
                          )}
                        </p>
                        {account.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                            {account.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          ${account.balance.toFixed(2)}
                        </p>
                        {(account.type === 'credit' || account.type === 'loan') && account.creditLimit > 0 && (
                          <p className="text-sm text-gray-500">
                            Limit: ${account.creditLimit.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No accounts found. Create your first account to get started.</p>
        </div>
      )}
    </div>
  );
} 