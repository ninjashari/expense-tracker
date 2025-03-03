'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import AccountForm from '@/components/forms/AccountForm';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface Account {
  _id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
}

interface AccountsListProps {
  accounts: Account[];
}

export default function AccountsList({ accounts }: AccountsListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add Account
        </button>
      </div>
      
      {accounts.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <li key={account._id}>
                <button
                  onClick={() => setEditingAccount(account)}
                  className="w-full text-left block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {account.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.type} • {formatCurrency(account.balance, account.currency)}
                        </p>
                        {account.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {account.description}
                          </p>
                        )}
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
          <p className="text-sm text-gray-500">No accounts found. Create your first account to get started.</p>
        </div>
      )}
      
      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Account"
      >
        <AccountForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
      
      {/* Edit Modal */}
      <Modal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        title="Edit Account"
      >
        {editingAccount && (
          <AccountForm
            accountId={editingAccount._id}
            initialData={{
              name: editingAccount.name,
              type: editingAccount.type,
              balance: editingAccount.balance,
              currency: editingAccount.currency,
              description: editingAccount.description,
            }}
            onSuccess={() => setEditingAccount(null)}
          />
        )}
      </Modal>
    </div>
  );
} 