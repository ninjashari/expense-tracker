import { Category } from '@/lib/types';

interface CategoryDetailsProps {
  category: Category;
}

export default function CategoryDetails({ category }: CategoryDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{category.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-lg font-medium">{category.description || 'No description'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-medium">Active</p>
        </div>
      </div>
    </div>
  );
} 