import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';
import AccountsList from '@/components/accounts/AccountsList';

export const metadata: Metadata = {
  title: 'Accounts | Finance Tracker',
  description: 'Manage your financial accounts',
};

export default async function AccountsPage() {
  const user = await requireAuth();
  await dbConnect();
  
  // Get accounts
  const accounts = await Account.find({ userId: user.id }).sort({ name: 1 });
  
  return (
    <AccountsList
      accounts={accounts.map(account => ({
        _id: account._id.toString(),
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        description: account.description,
      }))}
    />
  );
} 