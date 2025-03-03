import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface DashboardSummaryProps {
  totalBalance: number;
  accountCount: number;
  income: number;
  expenses: number;
  currency: string;
}

export default function DashboardSummary({
  totalBalance,
  accountCount,
  income,
  expenses,
  currency,
}: DashboardSummaryProps) {
  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance, currency),
      icon: BanknotesIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Accounts',
      value: accountCount.toString(),
      icon: CreditCardIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Income',
      value: formatCurrency(income, currency),
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Expenses',
      value: formatCurrency(expenses, currency),
      icon: ArrowTrendingDownIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{card.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 