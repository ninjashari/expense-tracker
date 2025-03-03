'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import PayeeForm from '@/components/forms/PayeeForm';

interface Payee {
  _id: string;
  name: string;
  description?: string;
}

interface PayeesListProps {
  payees: Payee[];
}

export default function PayeesList({ payees }: PayeesListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payees</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add Payee
        </button>
      </div>
      
      {payees.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {payees.map((payee) => (
              <li key={payee._id}>
                <button
                  onClick={() => setEditingPayee(payee)}
                  className="w-full text-left block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payee.name}
                          </p>
                          {payee.description && (
                            <p className="text-sm text-gray-500">
                              {payee.description}
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
          <p className="text-sm text-gray-500">No payees found. Create your first payee to get started.</p>
        </div>
      )}
      
      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Payee"
      >
        <PayeeForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
      
      {/* Edit Modal */}
      <Modal
        isOpen={!!editingPayee}
        onClose={() => setEditingPayee(null)}
        title="Edit Payee"
      >
        {editingPayee && (
          <PayeeForm
            payeeId={editingPayee._id}
            initialData={{
              name: editingPayee.name,
              description: editingPayee.description,
            }}
            onSuccess={() => setEditingPayee(null)}
          />
        )}
      </Modal>
    </div>
  );
} 