import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Transaction, Account } from '@/lib/models';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { TransactionType, TransactionStatus } from '@/lib/types';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

// Validation schema for creating transactions
const transactionSchema = z.object({
  date: z.date().or(z.string().transform(str => new Date(str))),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum([
    TransactionType.DEPOSIT, 
    TransactionType.WITHDRAWAL, 
    TransactionType.TRANSFER
  ]),
  status: z.enum([
    TransactionStatus.RECONCILED, 
    TransactionStatus.UNRECONCILED
  ]).default(TransactionStatus.UNRECONCILED),
  accountId: z.string(),
  categoryId: z.string().optional(),
  payeeId: z.string().optional(),
  notes: z.string().max(500).optional(),
  toAccountId: z.string().optional(),
});

// GET all transactions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }
    
    await dbConnect();
    
    // Parse query parameters
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { userId: session.user.id };
    
    if (accountId) {
      query.$or = [
        { accountId },
        { toAccountId: accountId }
      ];
    }
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('accountId')
      .populate('categoryId')
      .populate('payeeId')
      .populate('toAccountId');
    
    return successResponse({ 
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create a new transaction
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.accountId || !body.amount || !body.type || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate account ownership
    const account = await Account.findOne({
      _id: body.accountId,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // For transfers, validate target account
    if (body.type === TransactionType.TRANSFER) {
      if (!body.toAccountId) {
        return NextResponse.json(
          { error: 'Target account is required for transfers' },
          { status: 400 }
        );
      }

      const toAccount = await Account.findOne({
        _id: body.toAccountId,
        userId: session.user.id,
      });

      if (!toAccount) {
        return NextResponse.json(
          { error: 'Target account not found' },
          { status: 404 }
        );
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      ...body,
      userId: session.user.id,
    });

    // Update account balances
    const amount = Number(body.amount);
    
    if (body.type === TransactionType.TRANSFER) {
      // For transfers, deduct from source account and add to target account
      await Account.findByIdAndUpdate(body.accountId, {
        $inc: { balance: -amount },
      });
      
      await Account.findByIdAndUpdate(body.toAccountId, {
        $inc: { balance: amount },
      });
    } else {
      // For deposits and withdrawals, update single account
      const balanceChange = body.type === TransactionType.DEPOSIT ? amount : -amount;
      await Account.findByIdAndUpdate(body.accountId, {
        $inc: { balance: balanceChange },
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// Helper function to update account balances
async function updateAccountBalances(
  type: TransactionType,
  accountId: string,
  toAccountId: string | undefined,
  amount: number,
  userId: string
) {
  // Convert string IDs to ObjectIds
  const fromAccountObjectId = new Types.ObjectId(accountId);
  const toAccountObjectId = toAccountId ? new Types.ObjectId(toAccountId) : undefined;
  
  switch (type) {
    case TransactionType.DEPOSIT:
      // Increase account balance
      await Account.findOneAndUpdate(
        { _id: fromAccountObjectId, userId },
        { $inc: { balance: amount } }
      );
      break;
      
    case TransactionType.WITHDRAWAL:
      // Decrease account balance
      await Account.findOneAndUpdate(
        { _id: fromAccountObjectId, userId },
        { $inc: { balance: -amount } }
      );
      break;
      
    case TransactionType.TRANSFER:
      if (toAccountObjectId) {
        // Decrease from account balance
        await Account.findOneAndUpdate(
          { _id: fromAccountObjectId, userId },
          { $inc: { balance: -amount } }
        );
        
        // Increase to account balance
        await Account.findOneAndUpdate(
          { _id: toAccountObjectId, userId },
          { $inc: { balance: amount } }
        );
      }
      break;
  }
} 