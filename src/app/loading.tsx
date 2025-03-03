'use client';

import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-violet-600 font-medium">Loading...</p>
      </div>
    </div>
  );
} 