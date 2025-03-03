import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import AccountForm from '@/components/forms/AccountForm';

export const metadata: Metadata = {
  title: 'New Account | Finance Tracker',
  description: 'Create a new financial account',
};

export default async function NewAccountPage() {
  await requireAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new financial account to track your money.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <AccountForm />
      </div>
    </div>
  );
} 