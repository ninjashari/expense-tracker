import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Transaction, Account, Category, Payee } from '@/lib/models';
import TransactionForm from '@/components/forms/TransactionForm';

export const metadata: Metadata = {
  title: 'Edit Transaction | Finance Tracker',
  description: 'Edit an existing financial transaction',
};

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();
  await dbConnect();
  
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
  
  // Get accounts, categories, and payees
  const accounts = await Account.find({ userId: user.id }).sort({ name: 1 });
  const categories = await Category.find({ userId: user.id }).sort({ name: 1 });
  const payees = await Payee.find({ userId: user.id }).sort({ name: 1 });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href={`/dashboard/transactions/${transaction._id}`}
          className="mr-4 rounded-md bg-white p-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Back to transaction</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <TransactionForm 
          transaction={{
            _id: transaction._id.toString(),
            date: transaction.date.toISOString(),
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            accountId: {
              _id: transaction.accountId._id.toString(),
              name: transaction.accountId.name,
            },
            categoryId: transaction.categoryId ? {
              _id: transaction.categoryId._id.toString(),
              name: transaction.categoryId.name,
            } : undefined,
            payeeId: transaction.payeeId ? {
              _id: transaction.payeeId._id.toString(),
              name: transaction.payeeId.name,
            } : undefined,
            notes: transaction.notes,
            toAccountId: transaction.toAccountId ? {
              _id: transaction.toAccountId._id.toString(),
              name: transaction.toAccountId.name,
            } : undefined,
          }}
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