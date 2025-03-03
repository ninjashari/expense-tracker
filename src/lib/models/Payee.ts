import mongoose, { Schema } from 'mongoose';
import { Payee } from '../types';

const PayeeSchema = new Schema<Payee>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a payee name'],
      maxlength: [60, 'Payee name cannot be more than 60 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
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

// Create a compound index to ensure unique payees per user
PayeeSchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.models.Payee || mongoose.model<Payee>('Payee', PayeeSchema); 