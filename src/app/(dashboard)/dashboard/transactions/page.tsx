import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Transaction, Account, User, Category, Payee } from '@/lib/models';
import TransactionsClient from '@/components/transactions/TransactionsClient';
import { Types } from 'mongoose';

export const metadata: Metadata = {
  title: 'Transactions | Finance Tracker',
  description: 'Manage your financial transactions',
};

// Define interface for the query
interface TransactionQuery {
  userId: string;
  $or?: Array<{ accountId: string } | { toAccountId: string }>;
}

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
  const query: TransactionQuery = { userId: user.id };
  
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
    <TransactionsClient
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
      transactions={transactions.map(transaction => ({
        _id: transaction._id.toString(),
        date: transaction.date.toISOString(),
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        accountId: {
          _id: transaction.accountId._id.toString(),
          name: transaction.accountId.name,
          currency: transaction.accountId.currency,
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
          currency: transaction.toAccountId.currency,
        } : undefined,
      }))}
      defaultCurrency={defaultCurrency}
      accountId={accountId}
      total={total}
      page={page}
      totalPages={totalPages}
    />
  );
} 