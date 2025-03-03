'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AccountForm from '@/components/forms/AccountForm';

interface Account {
  _id: string;
  name: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  isActive: boolean;
  startDate: string;
  closedDate?: string;
  description?: string;
  creditLimit?: number;
  notes?: string;
}

interface AccountsTableProps {
  accounts: Account[];
}

export default function AccountsTable({ accounts }: AccountsTableProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatCurrency = (amount: number | null | undefined, currency: string) => {
    const value = amount ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getAccountTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      savings: 'Savings',
      checking: 'Checking',
      credit: 'Credit Card',
      cash: 'Cash',
      investment: 'Investment',
      loan: 'Loan',
      demat: 'Demat',
      other: 'Other',
    };
    return typeMap[type] || type;
  };

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Account Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Initial Balance
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Current Balance
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr
                    key={account._id}
                    onClick={() => handleRowClick(account)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {account.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getAccountTypeName(account.type)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                      {formatCurrency(account.initialBalance, account.currency)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                      {formatCurrency(account.currentBalance, account.currency)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        account.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-50"
      >
        <Transition show={isEditModalOpen}>
          <Transition.Child
            enter="transition-opacity ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                enter="transition-all ease-in-out duration-300"
                enterFrom="opacity-0 translate-y-4 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition-all ease-in-out duration-300"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-4 scale-95"
              >
                <Dialog.Panel className="mx-auto w-[40%] min-w-[800px] rounded-lg bg-white p-6 relative">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <Dialog.Title className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    Edit Account
                  </Dialog.Title>
                  
                  {selectedAccount && (
                    <AccountForm
                      accountId={selectedAccount._id}
                      initialData={selectedAccount}
                      onSuccess={() => setIsEditModalOpen(false)}
                    />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Transition>
      </Dialog>
    </>
  );
} 