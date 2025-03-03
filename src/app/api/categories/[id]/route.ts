import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import { Category } from '@/lib/models';

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
    
    const category = await Category.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id,
      },
      {
        name: body.name,
        description: body.description,
      },
      { new: true }
    );
    
    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

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
    
    const category = await Category.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CATEGORIES_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 