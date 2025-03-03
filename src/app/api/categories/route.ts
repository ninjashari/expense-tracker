import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Category } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    
    await dbConnect();
    
    const category = await Category.create({
      userId: session.user.id,
      name: body.name,
      description: body.description,
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 