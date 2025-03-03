import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import CategoryDetails from '@/components/categories/CategoryDetails';

export default async function CategoryPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await dbConnect();

  const category = await Category.findOne({
    _id: params.categoryId,
    userId: session.user.id,
  }).lean();

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CategoryDetails category={category} />
    </div>
  );
} 