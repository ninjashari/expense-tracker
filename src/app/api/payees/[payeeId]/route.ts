import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Payee } from '@/lib/models';

export async function PUT(
  request: Request,
  { params }: { params: { payeeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    
    await dbConnect();
    
    const payee = await Payee.findOneAndUpdate(
      { _id: params.payeeId, userId: session.user.id },
      { name: body.name, description: body.description },
      { new: true }
    );
    
    if (!payee) {
      return new NextResponse('Payee not found', { status: 404 });
    }
    
    return NextResponse.json(payee);
  } catch (error) {
    console.error('[PAYEE_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { payeeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    await dbConnect();
    
    const payee = await Payee.findOneAndDelete({
      _id: params.payeeId,
      userId: session.user.id,
    });
    
    if (!payee) {
      return new NextResponse('Payee not found', { status: 404 });
    }
    
    return NextResponse.json(payee);
  } catch (error) {
    console.error('[PAYEE_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 