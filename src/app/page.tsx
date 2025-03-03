import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';

export const metadata = {
  title: 'Finance Tracker - Personal Finance Management',
  description: 'A comprehensive personal finance management application',
};

export default async function Home() {
  // Check if user is authenticated
  const session = await getServerSession();
  
  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Take Control of Your</span>
            <span className="block text-blue-600 dark:text-blue-400">Financial Future</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-xl text-gray-500 dark:text-gray-300">
            Track your accounts, monitor expenses, and achieve your financial goals with our comprehensive finance management platform.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Log In
            </Link>
            <Link 
              href="/register" 
              className="rounded-md bg-white px-8 py-3 text-base font-medium text-blue-600 shadow-sm ring-1 ring-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign Up
            </Link>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Account Management</h2>
            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Track all your accounts in one place, from checking and savings to investments and loans.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Financial Reports</h2>
            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Visualize your spending patterns and financial progress with intuitive charts and reports.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Secure & Private</h2>
            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Your financial data is encrypted and secure. We never share your information with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
