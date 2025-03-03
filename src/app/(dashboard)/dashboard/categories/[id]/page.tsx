import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import dbConnect from '@/lib/db/connection';
import { Category } from '@/lib/models';
import CategoryForm from '@/components/forms/CategoryForm';

export const metadata: Metadata = {
  title: 'Edit Category | Finance Tracker',
  description: 'Edit transaction category',
};

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const user = await requireAuth();
  await dbConnect();
  
  const category = await Category.findOne({
    _id: params.id,
    userId: user.id,
  });
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your category details.
        </p>
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <CategoryForm
            categoryId={category._id.toString()}
            initialData={{
              name: category.name,
              description: category.description,
            }}
          />
        </div>
      </div>
    </div>
  );
} 