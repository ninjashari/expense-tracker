'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import TransactionForm from '@/components/forms/TransactionForm';
import { TransactionType, TransactionStatus } from '@/lib/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{ _id: string; name: string; type: string }>;
  categories: Array<{ _id: string; name: string }>;
  payees: Array<{ _id: string; name: string }>;
  transaction?: {
    _id: string;
    date: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    accountId: { _id: string; name: string };
    categoryId?: { _id: string; name: string };
    payeeId?: { _id: string; name: string };
    notes?: string;
    toAccountId?: { _id: string; name: string };
  };
}

export default function TransactionModal({
  isOpen,
  onClose,
  accounts,
  categories,
  payees,
  transaction
}: TransactionModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {transaction ? 'Edit Transaction' : 'Create New Transaction'}
                    </Dialog.Title>
                    <div className="mt-6">
                      <TransactionForm
                        transaction={transaction}
                        accounts={accounts}
                        categories={categories}
                        payees={payees}
                        onSuccess={onClose}
                      />
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 