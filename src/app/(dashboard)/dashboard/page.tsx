import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account, Transaction } from '@/lib/models';
import { TransactionType } from '@/lib/types';
import DashboardSummary from '@/components/dashboard/DashboardSummary';

export const metadata: Metadata = {
  title: 'Dashboard | Finance Tracker',
  description: 'View your financial summary',
};

export default async function DashboardPage() {
  const user = await requireAuth();
  await dbConnect();
  
  // Get accounts
  const accounts = await Account.find({ userId: user.id });
  
  // Get total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Get recent transactions
  const recentTransactions = await Transaction.find({ userId: user.id })
    .sort({ date: -1 })
    .limit(5)
    .populate('accountId')
    .populate('categoryId')
    .populate('payeeId');
  
  // Get income and expenses for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const monthlyTransactions = await Transaction.find({
    userId: user.id,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });
  
  const income = monthlyTransactions
    .filter(t => t.type === TransactionType.DEPOSIT)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = monthlyTransactions
    .filter(t => t.type === TransactionType.WITHDRAWAL)
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <DashboardSummary
        totalBalance={totalBalance}
        accountCount={accounts.length}
        income={income}
        expenses={expenses}
      />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id.toString()} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.payeeId ? transaction.payeeId.name : 'Transfer'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.accountId.name} • {transaction.categoryId?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <div className={`text-${transaction.type === TransactionType.DEPOSIT ? 'green' : 'red'}-600 font-medium`}>
                      {transaction.type === TransactionType.DEPOSIT ? '+' : '-'}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent transactions</p>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Accounts</h2>
          {accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account._id.toString()} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500">{account.type}</p>
                    </div>
                    <div className="font-medium text-gray-900">
                      ${account.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No accounts found</p>
          )}
        </div>
      </div>
    </div>
  );
} 