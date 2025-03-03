import { Metadata } from 'next';
import CategoryForm from '@/components/forms/CategoryForm';

export const metadata: Metadata = {
  title: 'New Category | Finance Tracker',
  description: 'Create a new transaction category',
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new category to organize your transactions.
        </p>
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <CategoryForm />
        </div>
      </div>
    </div>
  );
} 