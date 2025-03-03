import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db/connection';
import { User } from '@/lib/models';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return errorResponse('Not authenticated', 401);
    }
    
    // Find the user by email
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return errorResponse('Not authenticated', 401);
    }
    
    const body = await request.json();
    
    // Find the user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    // Update allowed fields
    if (body.defaultCurrency) {
      user.defaultCurrency = body.defaultCurrency;
    }
    
    // Save the updated user
    await user.save();
    
    // Remove password from response
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
} 