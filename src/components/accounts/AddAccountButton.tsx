'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AccountForm from '@/components/forms/AccountForm';

export default function AddAccountButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          + Add Account
        </button>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <Transition show={isOpen}>
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
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <Dialog.Title className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    Add New Account
                  </Dialog.Title>
                  
                  <AccountForm onSuccess={() => setIsOpen(false)} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Transition>
      </Dialog>
    </>
  );
} 