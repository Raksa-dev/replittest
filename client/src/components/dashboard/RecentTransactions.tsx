import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { formatCurrency } from '@/lib/utils';

interface RecentTransactionsProps {
  dashboardData: any;
  isLoading: boolean;
}

const TransactionTypeLabel = ({ type }: { type: string }) => {
  let bgColor = '';
  let textColor = '';
  let label = '';

  switch (type) {
    case 'sales_invoice':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Sales Invoice';
      break;
    case 'purchase_bill':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      label = 'Purchase Bill';
      break;
    case 'receipt':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = 'Receipt';
      break;
    case 'payment':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Payment';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      label = type;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

const StatusLabel = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';
  let label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'completed':
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'using_bnpl':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      label = 'Using BNPL';
      break;
    case 'overdue':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

const RecentTransactions = ({ dashboardData, isLoading }: RecentTransactionsProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (dashboardData && !isLoading && dashboardData.recentTransactions) {
      setTransactions(dashboardData.recentTransactions);
    }
  }, [dashboardData, isLoading]);
  
  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sales') return transaction.transactionType === 'sales_invoice';
    if (activeTab === 'purchases') return transaction.transactionType === 'purchase_bill';
    if (activeTab === 'payments') return transaction.transactionType === 'payment';
    if (activeTab === 'receipts') return transaction.transactionType === 'receipt';
    return true;
  });

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-neutral-800 mb-3">Recent Transactions</h2>
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
              onClick={() => setActiveTab('all')}
            >
              All Transactions
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'sales' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'purchases' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
              onClick={() => setActiveTab('purchases')}
            >
              Purchases
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'payments' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'receipts' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-neutral-600 hover:text-neutral-800'}`}
              onClick={() => setActiveTab('receipts')}
            >
              Receipts
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Number</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Party</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                // Show loading state
                Array(5).fill(null).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-neutral-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-5 bg-neutral-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-neutral-200 rounded w-28"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-neutral-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-neutral-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-5 bg-neutral-200 rounded w-20"></div></td>
                    <td className="px-4 py-3 text-right"><div className="h-4 bg-neutral-200 rounded w-10 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                // Show transactions data
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                      {new Date(transaction.transactionDate).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TransactionTypeLabel type={transaction.transactionType} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">{transaction.transactionNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                      {/* In a real app, would need to look up party name from partyId */}
                      {transaction.partyId === 1 ? "GlobalTech Solutions" :
                       transaction.partyId === 2 ? "Bharath Electronics Ltd" :
                       transaction.partyId === 3 ? "Sundar Innovations" :
                       transaction.partyId === 4 ? "Ashok Suppliers" :
                       transaction.partyId === 5 ? "Patel Enterprises" : "Unknown Party"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium font-mono text-neutral-800">
                      {formatCurrency(Number(transaction.amount))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusLabel status={transaction.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <Link href={`/transactions/${transaction.id}`}>
                        <a className="text-primary-600 hover:text-primary-800">View</a>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                // Show empty state
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No transactions found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-neutral-200 text-center">
          <Link href="/transactions">
            <a className="text-sm text-primary-600 font-medium hover:text-primary-700">
              View All Transactions
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
