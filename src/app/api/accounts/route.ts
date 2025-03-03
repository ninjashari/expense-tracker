import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Account, User } from '@/lib/models';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { DEFAULT_CURRENCY } from '@/lib/types';

// Validation schema for creating/updating accounts
const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(60),
  type: z.enum(['savings', 'checking', 'credit', 'demat', 'cash', 'investment', 'loan', 'other']),
  balance: z.number(),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().optional(),
  description: z.string().max(1000).optional(),
  startDate: z.date().or(z.string().transform(str => new Date(str))),
  closedDate: z.date().or(z.string().transform(str => new Date(str))).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

// GET all accounts for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }
    
    await dbConnect();
    
    const accounts = await Account.find({ userId: session.user.id });
    
    return successResponse({ accounts });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create a new account
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    
    await dbConnect();
    
    const account = await Account.create({
      userId: session.user.id,
      name: body.name,
      type: body.type,
      balance: body.balance,
      currency: body.currency,
      description: body.description,
    });
    
    return NextResponse.json(account);
  } catch (error) {
    console.error('[ACCOUNTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 