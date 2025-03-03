import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Transaction } from '@/lib/models';
import { Types } from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const accountIds = searchParams.getAll('accountId');
    const categoryIds = searchParams.getAll('categoryId');
    const payeeIds = searchParams.getAll('payeeId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    // Build query
    const query: any = { userId: session.user.id };
    
    if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate) };
    }
    
    if (accountIds.length > 0) {
      query.accountId = {
        $in: accountIds.map(id => new Types.ObjectId(id))
      };
    }
    
    if (categoryIds.length > 0) {
      query.categoryId = {
        $in: categoryIds.map(id => new Types.ObjectId(id))
      };
    }
    
    if (payeeIds.length > 0) {
      query.payeeId = {
        $in: payeeIds.map(id => new Types.ObjectId(id))
      };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Fetch transactions with populated references
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('accountId', 'name type')
      .populate('categoryId', 'name')
      .populate('payeeId', 'name')
      .lean();
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('[REPORTS_TRANSACTIONS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 