import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import TransactionDetails from '@/components/transactions/TransactionDetails';

export default async function TransactionPage({
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
      <TransactionDetails transaction={transaction} />
    </div>
  );
} 