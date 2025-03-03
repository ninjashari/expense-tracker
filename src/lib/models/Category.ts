import mongoose, { Schema } from 'mongoose';
import { Category } from '../types';

const CategorySchema = new Schema<Category>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      maxlength: [60, 'Category name cannot be more than 60 characters'],
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

// Create a compound index to ensure unique categories per user
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model<Category>('Category', CategorySchema); 