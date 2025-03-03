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

// Validation schema for updating transactions
const updateTransactionSchema = z.object({
  date: z.date().or(z.string().transform(str => new Date(str))).optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0').optional(),
  type: z.enum([
    TransactionType.DEPOSIT, 
    TransactionType.WITHDRAWAL, 
    TransactionType.TRANSFER
  ]).optional(),
  status: z.enum([
    TransactionStatus.RECONCILED, 
    TransactionStatus.UNRECONCILED
  ]).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  payeeId: z.string().optional(),
  notes: z.string().max(500).optional(),
  toAccountId: z.string().optional(),
});

// GET a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }
    
    await dbConnect();
    
    const transaction = await Transaction.findOne({
      _id: params.id,
      userId: session.user.id,
    })
      .populate('accountId')
      .populate('categoryId')
      .populate('payeeId')
      .populate('toAccountId');
    
    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }
    
    return successResponse({ transaction });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH update a transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }
    
    await dbConnect();
    
    // Find the existing transaction
    const existingTransaction = await Transaction.findOne({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!existingTransaction) {
      return errorResponse('Transaction not found', 404);
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateTransactionSchema.parse(body);
    
    // Additional validation for transfer transactions
    if (validatedData.type === TransactionType.TRANSFER && !validatedData.toAccountId && !existingTransaction.toAccountId) {
      return errorResponse('To Account is required for transfer transactions', 400);
    }
    
    // Revert previous account balances
    await revertAccountBalances(
      existingTransaction.type,
      existingTransaction.accountId.toString(),
      existingTransaction.toAccountId?.toString(),
      existingTransaction.amount,
      session.user.id
    );
    
    // Update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      params.id,
      { ...validatedData },
      { new: true, runValidators: true }
    )
      .populate('accountId')
      .populate('categoryId')
      .populate('payeeId')
      .populate('toAccountId');
    
    // Apply new account balances
    await updateAccountBalances(
      updatedTransaction.type,
      updatedTransaction.accountId.toString(),
      updatedTransaction.toAccountId?.toString(),
      updatedTransaction.amount,
      session.user.id
    );
    
    return successResponse({ transaction: updatedTransaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }
    
    return handleApiError(error);
  }
}

// DELETE a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }
    
    await dbConnect();
    
    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }
    
    // Revert account balances
    await revertAccountBalances(
      transaction.type,
      transaction.accountId.toString(),
      transaction.toAccountId?.toString(),
      transaction.amount,
      session.user.id
    );
    
    // Delete the transaction
    await Transaction.findByIdAndDelete(params.id);
    
    return successResponse({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return handleApiError(error);
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

// Helper function to revert account balances
async function revertAccountBalances(
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
      // Decrease account balance (reverse of deposit)
      await Account.findOneAndUpdate(
        { _id: fromAccountObjectId, userId },
        { $inc: { balance: -amount } }
      );
      break;
      
    case TransactionType.WITHDRAWAL:
      // Increase account balance (reverse of withdrawal)
      await Account.findOneAndUpdate(
        { _id: fromAccountObjectId, userId },
        { $inc: { balance: amount } }
      );
      break;
      
    case TransactionType.TRANSFER:
      if (toAccountObjectId) {
        // Increase from account balance (reverse of transfer out)
        await Account.findOneAndUpdate(
          { _id: fromAccountObjectId, userId },
          { $inc: { balance: amount } }
        );
        
        // Decrease to account balance (reverse of transfer in)
        await Account.findOneAndUpdate(
          { _id: toAccountObjectId, userId },
          { $inc: { balance: -amount } }
        );
      }
      break;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Find existing transaction
    const existingTransaction = await Transaction.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

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

    // Revert previous transaction's effect on account balances
    const oldAmount = Number(existingTransaction.amount);
    if (existingTransaction.type === TransactionType.TRANSFER) {
      await Account.findByIdAndUpdate(existingTransaction.accountId, {
        $inc: { balance: oldAmount },
      });
      await Account.findByIdAndUpdate(existingTransaction.toAccountId, {
        $inc: { balance: -oldAmount },
      });
    } else {
      const oldBalanceChange =
        existingTransaction.type === TransactionType.DEPOSIT
          ? -oldAmount
          : oldAmount;
      await Account.findByIdAndUpdate(existingTransaction.accountId, {
        $inc: { balance: oldBalanceChange },
      });
    }

    // Apply new transaction's effect on account balances
    const newAmount = Number(body.amount);
    if (body.type === TransactionType.TRANSFER) {
      await Account.findByIdAndUpdate(body.accountId, {
        $inc: { balance: -newAmount },
      });
      await Account.findByIdAndUpdate(body.toAccountId, {
        $inc: { balance: newAmount },
      });
    } else {
      const newBalanceChange =
        body.type === TransactionType.DEPOSIT ? newAmount : -newAmount;
      await Account.findByIdAndUpdate(body.accountId, {
        $inc: { balance: newBalanceChange },
      });
    }

    // Update transaction
    const transaction = await Transaction.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true }
    );

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Revert transaction's effect on account balances
    const amount = Number(transaction.amount);
    if (transaction.type === TransactionType.TRANSFER) {
      await Account.findByIdAndUpdate(transaction.accountId, {
        $inc: { balance: amount },
      });
      await Account.findByIdAndUpdate(transaction.toAccountId, {
        $inc: { balance: -amount },
      });
    } else {
      const balanceChange =
        transaction.type === TransactionType.DEPOSIT ? -amount : amount;
      await Account.findByIdAndUpdate(transaction.accountId, {
        $inc: { balance: balanceChange },
      });
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
} 