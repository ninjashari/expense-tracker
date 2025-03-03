import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';
import AccountsTable from '@/components/accounts/AccountsTable';
import AddAccountButton from '@/components/accounts/AddAccountButton';

export const metadata = {
  title: 'Accounts | Finance Tracker',
  description: 'Manage your accounts',
};

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();

  const accounts = await Account.find({ userId: session?.user?.id })
    .sort({ name: 1 })
    .lean();

  // Transform MongoDB documents to the expected format
  const formattedAccounts = accounts.map(account => {
    const { _id, name, type, balance, currency, isActive, startDate, closedDate, description, creditLimit, notes } = account as any;
    return {
      _id: _id.toString(),
      name,
      type,
      balance,
      currency,
      isActive,
      startDate,
      closedDate,
      description,
      creditLimit,
      notes,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <AddAccountButton />
      </div>
      
      <AccountsTable accounts={formattedAccounts} />
    </div>
  );
} 