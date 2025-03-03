import { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface TransactionDetailsProps {
  transaction: Transaction;
}

export default function TransactionDetails({ transaction }: TransactionDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Transaction Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="text-lg font-medium">{format(new Date(transaction.date), 'PP')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-lg font-medium">{formatCurrency(transaction.amount, transaction.accountId.currency)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="text-lg font-medium capitalize">{transaction.type.toLowerCase()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-medium capitalize">{transaction.status.toLowerCase()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Account</p>
          <p className="text-lg font-medium">{transaction.accountId.name}</p>
        </div>
        {transaction.categoryId && (
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="text-lg font-medium">{transaction.categoryId.name}</p>
          </div>
        )}
        {transaction.payeeId && (
          <div>
            <p className="text-sm text-muted-foreground">Payee</p>
            <p className="text-lg font-medium">{transaction.payeeId.name}</p>
          </div>
        )}
        {transaction.toAccountId && (
          <div>
            <p className="text-sm text-muted-foreground">To Account</p>
            <p className="text-lg font-medium">{transaction.toAccountId.name}</p>
          </div>
        )}
        {transaction.notes && (
          <div>
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-lg font-medium">{transaction.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
} 