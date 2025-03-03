'use client';

interface AccountFilterProps {
  accounts: Array<{ _id: string; name: string }>;
  selectedAccountId?: string;
}

export default function AccountFilter({ accounts, selectedAccountId }: AccountFilterProps) {
  return (
    <div>
      <label htmlFor="account-filter" className="block text-sm font-medium text-gray-700">
        Account
      </label>
      <select
        id="account-filter"
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
        defaultValue={selectedAccountId || ''}
        onChange={(e) => {
          const url = new URL(window.location.href);
          if (e.target.value) {
            url.searchParams.set('accountId', e.target.value);
          } else {
            url.searchParams.delete('accountId');
          }
          url.searchParams.delete('page');
          window.location.href = url.toString();
        }}
      >
        <option value="">All Accounts</option>
        {accounts.map((account) => (
          <option key={account._id.toString()} value={account._id.toString()}>
            {account.name}
          </option>
        ))}
      </select>
    </div>
  )
} 