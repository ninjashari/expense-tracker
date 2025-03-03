import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account, Category, Payee } from '@/lib/models';
import ReportsClient from '@/components/reports/ReportsClient';

export const metadata: Metadata = {
  title: 'Reports | Finance Tracker',
  description: 'Generate and export financial reports',
};

export default async function ReportsPage() {
  const user = await requireAuth();
  await dbConnect();
  
  // Fetch all filter options
  const [accounts, categories, payees] = await Promise.all([
    Account.find({ userId: user.id }).sort({ name: 1 }),
    Category.find({ userId: user.id }).sort({ name: 1 }),
    Payee.find({ userId: user.id }).sort({ name: 1 }),
  ]);
  
  return (
    <ReportsClient
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
  );
} 