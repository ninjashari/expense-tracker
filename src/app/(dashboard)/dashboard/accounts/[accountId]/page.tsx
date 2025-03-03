import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Account from '@/lib/models/Account';
import AccountDetails from '@/components/accounts/AccountDetails';

export default async function AccountPage({
  params,
}: {
  params: { accountId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await dbConnect();

  const account = await Account.findOne({
    _id: params.accountId,
    userId: session.user.id,
  })
    .populate('transactions')
    .lean();

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AccountDetails account={account} />
    </div>
  );
} 