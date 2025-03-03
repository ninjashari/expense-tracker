import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';

export async function PUT(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();
    const account = await Account.findOne({
      _id: params.accountId,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // If initialBalance has changed, update currentBalance accordingly
    if (data.initialBalance !== account.initialBalance) {
      const balanceDifference = data.initialBalance - account.initialBalance;
      data.currentBalance = account.currentBalance + balanceDifference;
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      params.accountId,
      { ...data },
      { new: true }
    );

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const account = await Account.findOneAndDelete({
      _id: params.accountId,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
} 