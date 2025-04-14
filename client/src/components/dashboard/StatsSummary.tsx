import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface StatsSummaryProps {
  dashboardData: any;
  isLoading: boolean;
}

const StatsSummaryItem = ({ title, amount, info, status, statusText, children }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        {status && (
          <div className={`bg-${status}-50 p-1 rounded text-xs font-medium text-${status}-700`}>
            {statusText}
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold font-mono text-neutral-800">
        {isNaN(amount) ? "₹0" : formatCurrency(amount)}
      </p>
      {children || (
        <div className="mt-2 flex items-center text-xs">
          {info}
        </div>
      )}
    </div>
  );
};

const StatsSummary = ({ dashboardData, isLoading }: StatsSummaryProps) => {
  const [data, setData] = useState({
    openPayables: { total: 0, count: 0 },
    openReceivables: { total: 0, count: 0 },
    purchaseBnplLimits: [{ totalLimit: 0, usedLimit: 0, expiryDate: new Date() }],
    cashPosition: 328450, // Sample data
  });

  useEffect(() => {
    if (dashboardData && !isLoading) {
      setData({
        openPayables: dashboardData.openPayables || { total: 0, count: 0 },
        openReceivables: dashboardData.openReceivables || { total: 0, count: 0 },
        purchaseBnplLimits: dashboardData.purchaseBnplLimits || [{ totalLimit: 0, usedLimit: 0, expiryDate: new Date() }],
        cashPosition: 328450, // Sample data, in a real app would come from API
      });
    }
  }, [dashboardData, isLoading]);

  // Calculate BNPL usage if available
  const bnplLimit = data.purchaseBnplLimits[0] || { totalLimit: 0, usedLimit: 0 };
  const bnplUsagePercent = bnplLimit.totalLimit > 0 
    ? Math.round((Number(bnplLimit.usedLimit) / Number(bnplLimit.totalLimit)) * 100) 
    : 0;

  const expiryDate = bnplLimit.expiryDate ? new Date(bnplLimit.expiryDate) : new Date();
  const formattedDueDate = expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsSummaryItem
        title="Open Payables"
        amount={data.openPayables.total}
        status="red"
        statusText="Due"
        info={
          <>
            <span className="text-error-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              12% ↑ from last month
            </span>
            <span className="ml-2 text-neutral-500">{data.openPayables.count} invoices</span>
          </>
        }
      />
      
      <StatsSummaryItem
        title="Open Receivables"
        amount={data.openReceivables.total}
        status="amber"
        statusText="Overdue"
        info={
          <>
            <span className="text-success-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              </svg>
              8% ↓ from last month
            </span>
            <span className="ml-2 text-neutral-500">{data.openReceivables.count} invoices</span>
          </>
        }
      />
      
      <StatsSummaryItem
        title="BNPL Limit Utilized"
        amount={bnplLimit.usedLimit}
        status="primary"
        statusText="Active"
      >
        <div className="mt-2 text-xs text-neutral-500">
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full" 
              style={{ width: `${bnplUsagePercent}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between">
            <span>{bnplUsagePercent}% of {formatCurrency(Number(bnplLimit.totalLimit))}</span>
            <span>Due: {formattedDueDate}</span>
          </div>
        </div>
      </StatsSummaryItem>
      
      <StatsSummaryItem
        title="Cash Position"
        amount={data.cashPosition}
        status="green"
        statusText="Positive"
        info={
          <>
            <span className="text-success-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              </svg>
              5% ↑ from last week
            </span>
            <span className="ml-2 text-neutral-500">Bank + Cash</span>
          </>
        }
      />
    </div>
  );
};

export default StatsSummary;
