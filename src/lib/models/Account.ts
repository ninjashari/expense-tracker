import mongoose, { Schema } from 'mongoose';
import { Account } from '../types';

const AccountSchema = new Schema<Account>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an account name'],
      maxlength: [60, 'Account name cannot be more than 60 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please provide an account type'],
      enum: ['savings', 'checking', 'credit', 'demat', 'cash', 'investment', 'loan', 'other'],
    },
    balance: {
      type: Number,
      required: [true, 'Please provide an account balance'],
      default: 0,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
      default: Date.now,
    },
    closedDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Account || mongoose.model<Account>('Account', AccountSchema); 