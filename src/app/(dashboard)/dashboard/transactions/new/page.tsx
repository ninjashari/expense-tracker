import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account, Category, Payee } from '@/lib/models';
import TransactionForm from '@/components/forms/TransactionForm';

export const metadata: Metadata = {
  title: 'Create New Transaction | Finance Tracker',
  description: 'Create a new financial transaction',
};

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await requireAuth();
  await dbConnect();
  
  // Get accounts, categories, and payees
  const accounts = await Account.find({ userId: user.id, isActive: true }).sort({ name: 1 });
  const categories = await Category.find({ userId: user.id }).sort({ name: 1 });
  const payees = await Payee.find({ userId: user.id }).sort({ name: 1 });
  
  // Check if an account ID was provided in the query params
  const accountId = typeof searchParams.accountId === 'string' ? searchParams.accountId : undefined;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/dashboard/transactions"
          className="mr-4 rounded-md bg-white p-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Back to transactions</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Transaction</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <TransactionForm 
          accounts={accounts.map(account => ({
            _id: account._id.toString(),
            name: account.name,
            type: account.type,
          }))}
          categories={categories.map(category => ({
            _id: category._id.toString(),
            name: category.name,
          }))}
          payees={payees.map(payee => ({
            _id: payee._id.toString(),
            name: payee.name,
          }))}
        />
      </div>
    </div>
  );
} 