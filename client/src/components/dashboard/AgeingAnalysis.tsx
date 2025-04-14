import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { formatCurrency } from '@/lib/utils';
// Added import for TrashIcon (assuming lucide-react is used)
import { TrashIcon } from 'lucide-react';


interface AgeingAnalysisProps {
  dashboardData: any;
  isLoading: boolean;
}

const AgeingAnalysis = ({ dashboardData, isLoading }: AgeingAnalysisProps) => {
  const [data, setData] = useState({
    receivablesAgeing: {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    },
    payablesAgeing: {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days60plus: 0
    }
  });

  useEffect(() => {
    if (dashboardData && !isLoading) {
      setData({
        receivablesAgeing: dashboardData.receivablesAgeing || {
          current: 0,
          days1to30: 0,
          days31to60: 0,
          days60plus: 0
        },
        payablesAgeing: dashboardData.payablesAgeing || {
          current: 0,
          days1to30: 0,
          days31to60: 0,
          days60plus: 0
        }
      });
    }
  }, [dashboardData, isLoading]);

  // If no data is loaded yet, use placeholder values
  if (isLoading) {
    // Keep the component structure but use placeholder values
    data.receivablesAgeing = {
      current: 148750,
      days1to30: 95240,
      days31to60: 124500,
      days60plus: 116750
    };

    data.payablesAgeing = {
      current: 48200,
      days1to30: 65300,
      days31to60: 82000,
      days60plus: 50300
    };
  }

  // Calculate totals
  const totalReceivables = 
    data.receivablesAgeing.current + 
    data.receivablesAgeing.days1to30 + 
    data.receivablesAgeing.days31to60 + 
    data.receivablesAgeing.days60plus;

  const totalPayables = 
    data.payablesAgeing.current + 
    data.payablesAgeing.days1to30 + 
    data.payablesAgeing.days31to60 + 
    data.payablesAgeing.days60plus;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-neutral-800 mb-3">Ageing Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Receivables Ageing */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-medium text-neutral-800">Receivables Ageing</h3>
            <div> {/* Changed Link to div to avoid nesting */}
              <Link href="/receivables">
                <a className="text-sm text-primary-600 hover:text-primary-700">View All</a>
              </Link>
            </div>
          </div>
          <div className="p-4">
            <div className="flex mb-3">
              <div className="w-1/4 pr-2">
                <div className="h-24 flex flex-col justify-center items-center bg-green-50 border border-green-200 rounded-md">
                  <span className="text-green-800 font-semibold font-mono">{formatCurrency(data.receivablesAgeing.current)}</span>
                  <span className="text-xs text-green-700 mt-1">Current</span>
                </div>
              </div>
              <div className="w-1/4 px-2">
                <div className="h-24 flex flex-col justify-center items-center bg-yellow-50 border border-yellow-200 rounded-md">
                  <span className="text-yellow-800 font-semibold font-mono">{formatCurrency(data.receivablesAgeing.days1to30)}</span>
                  <span className="text-xs text-yellow-700 mt-1">1-30 Days</span>
                </div>
              </div>
              <div className="w-1/4 px-2">
                <div className="h-24 flex flex-col justify-center items-center bg-orange-50 border border-orange-200 rounded-md">
                  <span className="text-orange-800 font-semibold font-mono">{formatCurrency(data.receivablesAgeing.days31to60)}</span>
                  <span className="text-xs text-orange-700 mt-1">31-60 Days</span>
                </div>
              </div>
              <div className="w-1/4 pl-2">
                <div className="h-24 flex flex-col justify-center items-center bg-red-50 border border-red-200 rounded-md">
                  <span className="text-red-800 font-semibold font-mono">{formatCurrency(data.receivablesAgeing.days60plus)}</span>
                  <span className="text-xs text-red-700 mt-1">60+ Days</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              Total Receivables: {formatCurrency(totalReceivables)}
            </div>
          </div>
        </div>

        {/* Payables Ageing */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-medium text-neutral-800">Payables Ageing</h3>
            <div> {/* Changed Link to div to avoid nesting */}
              <Link href="/payables">
                <a className="text-sm text-primary-600 hover:text-primary-700">View All</a>
              </Link>
            </div>
          </div>
          <div className="p-4">
            <div className="flex mb-3">
              <div className="w-1/4 pr-2">
                <div className="h-24 flex flex-col justify-center items-center bg-green-50 border border-green-200 rounded-md">
                  <span className="text-green-800 font-semibold font-mono">{formatCurrency(data.payablesAgeing.current)}</span>
                  <span className="text-xs text-green-700 mt-1">Current</span>
                </div>
              </div>
              <div className="w-1/4 px-2">
                <div className="h-24 flex flex-col justify-center items-center bg-yellow-50 border border-yellow-200 rounded-md">
                  <span className="text-yellow-800 font-semibold font-mono">{formatCurrency(data.payablesAgeing.days1to30)}</span>
                  <span className="text-xs text-yellow-700 mt-1">1-30 Days</span>
                </div>
              </div>
              <div className="w-1/4 px-2">
                <div className="h-24 flex flex-col justify-center items-center bg-orange-50 border border-orange-200 rounded-md">
                  <span className="text-orange-800 font-semibold font-mono">{formatCurrency(data.payablesAgeing.days31to60)}</span>
                  <span className="text-xs text-orange-700 mt-1">31-60 Days</span>
                </div>
              </div>
              <div className="w-1/4 pl-2">
                <div className="h-24 flex flex-col justify-center items-center bg-red-50 border border-red-200 rounded-md">
                  <span className="text-red-800 font-semibold font-mono">{formatCurrency(data.payablesAgeing.days60plus)}</span>
                  <span className="text-xs text-red-700 mt-1">60+ Days</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              Total Payables: {formatCurrency(totalPayables)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeingAnalysis;


// Example of how to use TrashIcon in NewInvoice component.  This is added based on the error message.
// This component needs to be defined elsewhere in your project.
const NewInvoice = () => {
  return (
    <div>
      <TrashIcon /> {/* Using TrashIcon */}
    </div>
  );
};