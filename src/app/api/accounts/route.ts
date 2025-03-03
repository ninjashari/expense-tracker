import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Account } from '@/lib/models';
import { DEFAULT_CURRENCY } from '@/lib/types';

// Validation schema for creating/updating accounts
const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(60),
  type: z.enum(['savings', 'checking', 'credit', 'cash', 'investment', 'loan', 'demat', 'other']),
  initialBalance: z.number().default(0),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().optional(),
  description: z.string().max(1000).optional(),
  startDate: z.string(),
  closedDate: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

// GET all accounts for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const accounts = await Account.find({ userId: session.user.id })
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST create a new account
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    const validatedData = accountSchema.parse(data);
    
    const account = await Account.create({
      ...validatedData,
      userId: session.user.id,
      currentBalance: validatedData.initialBalance, // Set initial currentBalance equal to initialBalance
    });
    
    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
} 