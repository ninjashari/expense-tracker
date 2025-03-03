'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import CategoryForm from '@/components/forms/CategoryForm';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface CategoriesListProps {
  categories: Category[];
}

export default function CategoriesList({ categories }: CategoriesListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Category
        </button>
      </div>
      
      {categories.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category._id}>
                <button
                  onClick={() => setEditingCategory(category)}
                  className="w-full text-left block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No categories found. Create your first category to get started.</p>
        </div>
      )}
      
      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Category"
      >
        <CategoryForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
      
      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        {editingCategory && (
          <CategoryForm
            categoryId={editingCategory._id}
            initialData={{
              name: editingCategory.name,
              description: editingCategory.description,
            }}
            onSuccess={() => setEditingCategory(null)}
          />
        )}
      </Modal>
    </div>
  );
} 