import { Account } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface AccountDetailsProps {
  account: Account;
}

export default function AccountDetails({ account }: AccountDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{account.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Initial Balance</p>
          <p className="text-lg font-medium">{formatCurrency(account.initialBalance, account.currency)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-lg font-medium">{formatCurrency(account.currentBalance, account.currency)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Start Date</p>
          <p className="text-lg font-medium">{format(new Date(account.startDate), 'PP')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-medium">{account.isActive ? 'Active' : 'Closed'}</p>
        </div>
        {account.closedDate && (
          <div>
            <p className="text-sm text-muted-foreground">Closed Date</p>
            <p className="text-lg font-medium">{format(new Date(account.closedDate), 'PP')}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Notes</p>
          <p className="text-lg font-medium">{account.notes || 'No notes'}</p>
        </div>
      </div>
    </div>
  );
} 