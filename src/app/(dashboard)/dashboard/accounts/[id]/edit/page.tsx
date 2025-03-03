import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';
import AccountForm from '@/components/forms/AccountForm';

export const metadata: Metadata = {
  title: 'Edit Account | Finance Tracker',
  description: 'Edit your financial account details',
};

export default async function EditAccountPage({
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
  
  // Convert Mongoose document to plain object
  const accountData = {
    _id: account._id.toString(),
    name: account.name,
    type: account.type,
    balance: account.balance,
    creditLimit: account.creditLimit || 0,
    description: account.description || '',
    startDate: account.startDate.toISOString(),
    closedDate: account.closedDate ? account.closedDate.toISOString() : undefined,
    isActive: account.isActive,
    notes: account.notes || '',
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your account information.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <AccountForm account={accountData} />
      </div>
    </div>
  );
} 