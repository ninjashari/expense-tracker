import mongoose, { Schema, model, models, Types } from 'mongoose';
import { Account, DEFAULT_CURRENCY } from '../types';

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
      enum: ['savings', 'checking', 'credit', 'cash', 'investment', 'loan', 'demat', 'other'],
    },
    initialBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: [true, 'Please provide a currency'],
      default: DEFAULT_CURRENCY,
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
      type: String,
      required: [true, 'Please provide a start date'],
      default: () => new Date().toISOString().split('T')[0],
    },
    closedDate: {
      type: String,
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

// Virtual field to calculate current balance based on transactions
AccountSchema.virtual('calculatedBalance').get(async function() {
  const Transaction = models.Transaction;
  if (!Transaction) return this.initialBalance;

  const transactions = await Transaction.aggregate([
    {
      $match: {
        accountId: this._id,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'expense'] },
              { $multiply: ['$amount', -1] },
              '$amount'
            ]
          }
        }
      }
    }
  ]);

  const transactionTotal = transactions.length > 0 ? transactions[0].total : 0;
  return this.initialBalance + transactionTotal;
});

// Pre-save middleware to ensure currentBalance matches initialBalance for new accounts
AccountSchema.pre('save', function(next) {
  if (this.isNew) {
    this.currentBalance = this.initialBalance;
  }
  next();
});

export default models.Account || model<Account>('Account', AccountSchema); 