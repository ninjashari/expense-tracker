import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Category } from '@/lib/models';
import CategoriesList from '@/components/categories/CategoriesList';

export const metadata: Metadata = {
  title: 'Categories | Finance Tracker',
  description: 'Manage your transaction categories',
};

export default async function CategoriesPage() {
  const user = await requireAuth();
  await dbConnect();
  
  // Get categories
  const categories = await Category.find({ userId: user.id }).sort({ name: 1 });
  
  return (
    <CategoriesList
      categories={categories.map(category => ({
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
      }))}
    />
  );
} 