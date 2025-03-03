import { NextRequest } from 'next/server';
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

// PATCH update a specific account
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
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateAccountSchema.parse(body);
    
    // Find and update the account
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: validatedData },
      { new: true, runValidators: true }
    );
    
    if (!updatedAccount) {
      return errorResponse('Account not found', 404);
    }
    
    return successResponse({ account: updatedAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }
    
    return handleApiError(error);
  }
}

// DELETE a specific account
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
    
    const deletedAccount = await Account.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!deletedAccount) {
      return errorResponse('Account not found', 404);
    }
    
    return successResponse({ message: 'Account deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
} 