import mongoose, { Schema } from 'mongoose';
import { User } from '../types';

const UserSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      maxlength: [30, 'First name cannot be more than 30 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      maxlength: [30, 'Last name cannot be more than 30 characters'],
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot be more than 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<User>('User', UserSchema); 