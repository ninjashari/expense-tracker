import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import dbConnect from '@/lib/db/connection';
import { User } from '@/lib/models';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { DEFAULT_CURRENCY } from '@/lib/types';

// Validation schema for user registration
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(30),
  lastName: z.string().min(1, 'Last name is required').max(30),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  defaultCurrency: z.string().default(DEFAULT_CURRENCY),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = registerSchema.parse(body);
    
    // Check if user with email already exists
    const existingUserByEmail = await User.findOne({ email: validatedData.email });
    if (existingUserByEmail) {
      return errorResponse('User with this email already exists', 409);
    }
    
    // Check if user with username already exists
    const existingUserByUsername = await User.findOne({ username: validatedData.username });
    if (existingUserByUsername) {
      return errorResponse('Username is already taken', 409);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create new user
    const newUser = await User.create({
      ...validatedData,
      password: hashedPassword,
      defaultCurrency: validatedData.defaultCurrency || DEFAULT_CURRENCY,
    });
    
    // Remove password from response
    const user = newUser.toObject();
    delete user.password;
    
    return successResponse({ user }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }
    
    return handleApiError(error);
  }
} 