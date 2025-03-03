import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Payee } from '@/lib/models';
import PayeesList from '@/components/payees/PayeesList';

export const metadata: Metadata = {
  title: 'Payees | Finance Tracker',
  description: 'Manage your transaction payees',
};

export default async function PayeesPage() {
  const user = await requireAuth();
  await dbConnect();
  
  // Get payees
  const payees = await Payee.find({ userId: user.id }).sort({ name: 1 });
  
  return (
    <PayeesList
      payees={payees.map(payee => ({
        _id: payee._id.toString(),
        name: payee.name,
        description: payee.description,
      }))}
    />
  );
} 