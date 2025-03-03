import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Payee } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    
    await dbConnect();
    
    const payee = await Payee.create({
      userId: session.user.id,
      name: body.name,
      description: body.description,
    });
    
    return NextResponse.json(payee);
  } catch (error) {
    console.error('[PAYEES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 