import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import TransactionForm from '@/components/forms/TransactionForm';

export default async function EditTransactionPage({
  params,
}: {
  params: { transactionId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await dbConnect();

  const transaction = await Transaction.findOne({
    _id: params.transactionId,
    userId: session.user.id,
  })
    .populate('accountId')
    .populate('categoryId')
    .populate('payeeId')
    .populate('toAccountId')
    .lean();

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <TransactionForm transaction={transaction} />
    </div>
  );
} 