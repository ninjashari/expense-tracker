import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Validation schema for updating accounts
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(60).optional(),
  type: z.enum(['savings', 'checking', 'credit', 'demat', 'cash', 'investment', 'loan', 'other']).optional(),
  balance: z.number().optional(),
  currency: z.string().min(1, 'Currency is required').optional(),
  creditLimit: z.number().optional(),
  description: z.string().max(1000).optional(),
  startDate: z.date().or(z.string().transform(str => new Date(str))).optional(),
  closedDate: z.date().or(z.string().transform(str => new Date(str))).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

// GET a specific account
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
    
    const account = await Account.findOne({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!account) {
      return errorResponse('Account not found', 404);
    }
    
    return successResponse({ account });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT update a specific account
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    
    await dbConnect();
    
    const account = await Account.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id,
      },
      {
        name: body.name,
        type: body.type,
        balance: body.balance,
        currency: body.currency,
        description: body.description,
      },
      { new: true }
    );
    
    if (!account) {
      return new NextResponse('Account not found', { status: 404 });
    }
    
    return NextResponse.json(account);
  } catch (error) {
    console.error('[ACCOUNTS_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// DELETE a specific account
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    await dbConnect();
    
    const account = await Account.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!account) {
      return new NextResponse('Account not found', { status: 404 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ACCOUNTS_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 