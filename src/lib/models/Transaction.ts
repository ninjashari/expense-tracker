import mongoose, { Schema } from 'mongoose';
import { Transaction, TransactionStatus, TransactionType } from '../types';

const TransactionSchema = new Schema<Transaction>(
  {
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a transaction amount'],
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Please provide a transaction type'],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.UNRECONCILED,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Please provide an account ID'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    payeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Payee',
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
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      // Required only for transfer transactions
    },
  },
  {
    timestamps: true,
  }
);

// Add validation for transfer transactions
TransactionSchema.pre('validate', function (next) {
  if (this.type === TransactionType.TRANSFER && !this.toAccountId) {
    this.invalidate('toAccountId', 'To Account is required for transfer transactions');
  }
  next();
});

export default mongoose.models.Transaction || mongoose.model<Transaction>('Transaction', TransactionSchema); 